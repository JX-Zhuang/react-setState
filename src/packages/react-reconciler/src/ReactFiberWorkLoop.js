import {
    markRootUpdated,
    mergeLanes,
    NoLanes
} from './ReactFiberLane';
import {
    HostRoot
} from './ReactWorkTags';
import { beginWork } from './ReactFiberBeginWork';
import {
    NoFlags,
    PerformedWork,
    Placement,
    Update,
    PlacementAndUpdate,
    Deletion,
    Ref,
    ContentReset,
    Snapshot,
    Callback,
    Passive,
    PassiveUnmountPendingDev,
    Incomplete,
    HostEffectMask,
    Hydrating,
    HydratingAndUpdate,
} from './ReactFiberFlags';
import { completeWork } from './ReactFiberCompleteWork';
export const NoContext = /*             */ 0b0000000;
const BatchedContext = /*               */ 0b0000001;
const EventContext = /*                 */ 0b0000010;
const DiscreteEventContext = /*         */ 0b0000100;
const LegacyUnbatchedContext = /*       */ 0b0001000;
const RenderContext = /*                */ 0b0010000;
const CommitContext = /*                */ 0b0100000;
export const RetryAfterError = /*       */ 0b1000000;
let subtreeRenderLanes = NoLanes;
// FiberRoot:The root we're working on
let workInProgressRoot = null;
// Fiber:The fiber we're working on
let workInProgress = null;

let mostRecentlyUpdatedRoot = null;
let executionContext = NoContext;
let workInProgressRootRenderTargetTime: number = Infinity;

function resetRenderTimer() {
    // workInProgressRootRenderTargetTime = now() + RENDER_TIMEOUT_MS;
}

export function unbatchedUpdates(fn) {
    const prevExecutionContext = executionContext;
    executionContext &= ~BatchedContext;
    executionContext |= LegacyUnbatchedContext;
    try {

        return fn(a);
    } finally {
        // 暂时不看
        // executionContext = prevExecutionContext;
        // if (executionContext === NoContext) {
        //     // Flush the immediate callbacks that were scheduled during this batch
        //     resetRenderTimer();
        //     flushSyncCallbackQueue();
        // }
    }
}


export function scheduleUpdateOnFiber(
    fiber: Fiber,
    lane: Lane,
    eventTime: number,
) {
    const root = markUpdateLaneFromFiberToRoot(fiber, lane);
    if (root === null) {
        return null;
    }

    // Mark that the root has a pending update.
    markRootUpdated(root, lane, eventTime);

    if (root === workInProgressRoot) {
        // Received an update to a tree that's in the middle of rendering. Mark
        // that there was an interleaved update work on this root. Unless the
        // `deferRenderPhaseUpdateToNextBatch` flag is off and this is a render
        // phase update. In that case, we don't treat render phase updates as if
        // they were interleaved, for backwards compat reasons.
        if (
            deferRenderPhaseUpdateToNextBatch ||
            (executionContext & RenderContext) === NoContext
        ) {
            workInProgressRootUpdatedLanes = mergeLanes(
                workInProgressRootUpdatedLanes,
                lane,
            );
        }
        if (workInProgressRootExitStatus === RootSuspendedWithDelay) {
            // The root already suspended with a delay, which means this render
            // definitely won't finish. Since we have a new update, let's mark it as
            // suspended now, right before marking the incoming update. This has the
            // effect of interrupting the current render and switching to the update.
            // TODO: Make sure this doesn't override pings that happen while we've
            // already started rendering.
            markRootSuspended(root, workInProgressRootRenderLanes);
        }
    }

    // TODO: requestUpdateLanePriority also reads the priority. Pass the
    // priority as an argument to that function and this one.
    const priorityLevel = getCurrentPriorityLevel();

    if (lane === SyncLane) {
        // 同步渲染
        if (
            // Check if we're inside unbatchedUpdates
            (executionContext & LegacyUnbatchedContext) !== NoContext &&
            // Check if we're not already rendering
            (executionContext & (RenderContext | CommitContext)) === NoContext
        ) {
            // Register pending interactions on the root to avoid losing traced interaction data.
            schedulePendingInteractions(root, lane);

            // This is a legacy edge case. The initial mount of a ReactDOM.render-ed
            // root inside of batchedUpdates should be synchronous, but layout updates
            // should be deferred until the end of the batch.
            performSyncWorkOnRoot(root);
        } else {
            ensureRootIsScheduled(root, eventTime);
            schedulePendingInteractions(root, lane);
            if (executionContext === NoContext) {
                // Flush the synchronous work now, unless we're already working or inside
                // a batch. This is intentionally inside scheduleUpdateOnFiber instead of
                // scheduleCallbackForFiber to preserve the ability to schedule a callback
                // without immediately flushing it. We only do this for user-initiated
                // updates, to preserve historical behavior of legacy mode.
                resetRenderTimer();
                flushSyncCallbackQueue();
            }
        }
    } else {
        // 异步渲染
        // Schedule a discrete update but only if it's not Sync.
        if (
            (executionContext & DiscreteEventContext) !== NoContext &&
            // Only updates at user-blocking priority or greater are considered
            // discrete, even inside a discrete event.
            (priorityLevel === UserBlockingSchedulerPriority ||
                priorityLevel === ImmediateSchedulerPriority)
        ) {
            // This is the result of a discrete event. Track the lowest priority
            // discrete update per root so we can flush them early, if needed.
            if (rootsWithPendingDiscreteUpdates === null) {
                rootsWithPendingDiscreteUpdates = new Set([root]);
            } else {
                rootsWithPendingDiscreteUpdates.add(root);
            }
        }
        // Schedule other updates after in case the callback is sync.
        ensureRootIsScheduled(root, eventTime);
        schedulePendingInteractions(root, lane);
    }
    mostRecentlyUpdatedRoot = root;
}


// This is split into a separate function so we can mark a fiber with pending
// work without treating it as a typical update that originates from an event;
// e.g. retrying a Suspense boundary isn't an update, but it does schedule work
// on a fiber.
/**
 * 从当前的fiber遍历到root，更新lane
 * @param {*} sourceFiber 
 * @param {*} lane 
 * @returns 
 */
function markUpdateLaneFromFiberToRoot(
    sourceFiber,
    lane
) {
    // Update the source fiber's lanes
    sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
    let alternate = sourceFiber.alternate;
    if (alternate !== null) {
        alternate.lanes = mergeLanes(alternate.lanes, lane);
    }
    // Walk the parent path to the root and update the child expiration time.
    let node = sourceFiber;
    let parent = sourceFiber.return;
    while (parent !== null) {
        parent.childLanes = mergeLanes(parent.childLanes, lane);
        alternate = parent.alternate;
        if (alternate !== null) {
            alternate.childLanes = mergeLanes(alternate.childLanes, lane);
        }
        node = parent;
        parent = parent.return;
    }
    if (node.tag === HostRoot) {
        const root = node.stateNode;
        return root;
    } else {
        return null;
    }
}

// Use this function to schedule a task for a root. There's only one task per
// root; if a task was already scheduled, we'll check to make sure the priority
// of the existing task is the same as the priority of the next level that the
// root has work on. This function is called on every update, and right before
// exiting a task.
function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {
    const existingCallbackNode = root.callbackNode;

    // Check if any lanes are being starved by other work. If so, mark them as
    // expired so we know to work on those next.

    // 暂时不看
    // markStarvedLanesAsExpired(root, currentTime);

    // Determine the next lanes to work on, and their priority.
    const nextLanes = getNextLanes(
        root,
        root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
    );
    // This returns the priority level computed during the `getNextLanes` call.
    const newCallbackPriority = returnNextLanesPriority();

    if (nextLanes === NoLanes) {
        // Special case: There's nothing to work on.
        if (existingCallbackNode !== null) {
            cancelCallback(existingCallbackNode);
            root.callbackNode = null;
            root.callbackPriority = NoLanePriority;
        }
        return;
    }

    // Check if there's an existing task. We may be able to reuse it.
    if (existingCallbackNode !== null) {
        const existingCallbackPriority = root.callbackPriority;
        if (existingCallbackPriority === newCallbackPriority) {
            // The priority hasn't changed. We can reuse the existing task. Exit.
            return;
        }
        // The priority changed. Cancel the existing callback. We'll schedule a new
        // one below.
        cancelCallback(existingCallbackNode);
    }

    // Schedule a new callback.
    let newCallbackNode;
    if (newCallbackPriority === SyncLanePriority) {
        // 同步
        newCallbackNode = scheduleSyncCallback(
            performSyncWorkOnRoot.bind(null, root),
        );
    } else if (newCallbackPriority === SyncBatchedLanePriority) {
        // 异步
        newCallbackNode = scheduleCallback(
            ImmediateSchedulerPriority,
            performSyncWorkOnRoot.bind(null, root),
        );
    } else {
        // 异步
        const schedulerPriorityLevel = lanePriorityToSchedulerPriority(
            newCallbackPriority,
        );
        newCallbackNode = scheduleCallback(
            schedulerPriorityLevel,
            performConcurrentWorkOnRoot.bind(null, root),
        );
    }

    root.callbackPriority = newCallbackPriority;
    root.callbackNode = newCallbackNode;
}


// The work loop is an extremely hot path. Tell Closure not to inline it.
/** @noinline */
/**
 * 同步
 */
function workLoopSync() {
    // Already timed out, so perform work without checking if we need to yield.
    while (workInProgress !== null) {
        performUnitOfWork(workInProgress);
    }
}

/** @noinline */
/**
 * 异步
 */
function workLoopConcurrent() {
    // && !shouldYield() 暂时忽略
    while (workInProgress !== null) {
        performUnitOfWork(workInProgress);
    }
    // Perform work until Scheduler asks us to yield
    // while (workInProgress !== null && !shouldYield()) {
    //     performUnitOfWork(workInProgress);
    // }
}

/**
 * 
 * @param {Fiber} unitOfWork 
 * @returns Fiber
 */
function completeUnitOfWork(unitOfWork) {
    let completedWork = unitOfWork;
    do {
        // The current, flushed, state of this fiber is the alternate. Ideally
        // nothing should rely on this, but relying on it here means that we don't
        // need an additional field on the work in progress.
        const current = completedWork.alternate;
        const returnFiber = completedWork.return;
        // Check if the work completed or if something threw.
        if ((completedWork.flags & Incomplete) === NoFlags) {
            let next;
            next = completeWork(current, completedWork, subtreeRenderLanes);
            if (next !== null) {
                // 继续 beginWork
                workInProgress = next;
                return;
            }

            resetChildLanes(completedWork);

            if (
                returnFiber !== null &&
                // Do not append effects to parents if a sibling failed to complete
                (returnFiber.flags & Incomplete) === NoFlags
            ) {
                // Append all the effects of the subtree and this fiber onto the effect
                // list of the parent. The completion order of the children affects the
                // side-effect order.
                if (returnFiber.firstEffect === null) {
                    returnFiber.firstEffect = completedWork.firstEffect;
                }
                if (completedWork.lastEffect !== null) {
                    if (returnFiber.lastEffect !== null) {
                        returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
                    }
                    returnFiber.lastEffect = completedWork.lastEffect;
                }

                // If this fiber had side-effects, we append it AFTER the children's
                // side-effects. We can perform certain side-effects earlier if needed,
                // by doing multiple passes over the effect list. We don't want to
                // schedule our own side-effect on our own list because if end up
                // reusing children we'll schedule this effect onto itself since we're
                // at the end.
                const flags = completedWork.flags;

                // Skip both NoWork and PerformedWork tags when creating the effect
                // list. PerformedWork effect is read by React DevTools but shouldn't be
                // committed.
                if (flags > PerformedWork) {
                    if (returnFiber.lastEffect !== null) {
                        returnFiber.lastEffect.nextEffect = completedWork;
                    } else {
                        returnFiber.firstEffect = completedWork;
                    }
                    returnFiber.lastEffect = completedWork;
                }
            }
        } else {
            // This fiber did not complete because something threw. Pop values off
            // the stack without entering the complete phase. If this is a boundary,
            // capture values if possible.
            const next = unwindWork(completedWork, subtreeRenderLanes);

            // Because this fiber did not complete, don't reset its expiration time.

            if (next !== null) {
                // If completing this work spawned new work, do that next. We'll come
                // back here again.
                // Since we're restarting, remove anything that is not a host effect
                // from the effect tag.
                next.flags &= HostEffectMask;
                workInProgress = next;
                return;
            }

            if (returnFiber !== null) {
                // Mark the parent fiber as incomplete and clear its effect list.
                returnFiber.firstEffect = returnFiber.lastEffect = null;
                returnFiber.flags |= Incomplete;
            }
        }

        const siblingFiber = completedWork.sibling;
        if (siblingFiber !== null) {
            // If there is more work to do in this returnFiber, do that next.
            workInProgress = siblingFiber;
            return;
        }
        // Otherwise, return to the parent
        completedWork = returnFiber;
        // Update the next thing we're working on in case something throws.
        workInProgress = completedWork;
    } while (completedWork !== null);

    // We've reached the root.
    if (workInProgressRootExitStatus === RootIncomplete) {
        workInProgressRootExitStatus = RootCompleted;
    }
}

/**
 * 
 * @param {*} unitOfWork:Fiber
 */
function performUnitOfWork(unitOfWork) {
    // 即fiber.alternate, 指向当前页面正在使用的fiber节点. 
    // 初次构造时, 页面还未渲染, 此时 current = null ?
    const current = unitOfWork.alternate;
    let next = beginWork(current, unitOfWork, subtreeRenderLanes);
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    if (next === null) {
        completeUnitOfWork(unitOfWork);
    } else {
        workInProgress = next;
    }

    // 暂时忽略
    // The current, flushed, state of this fiber is the alternate. Ideally
    // nothing should rely on this, but relying on it here means that we don't
    // need an additional field on the work in progress.
    // const current = unitOfWork.alternate;
    // let next;
    // if (enableProfilerTimer && (unitOfWork.mode & ProfileMode) !== NoMode) {
    //     startProfilerTimer(unitOfWork);
    //     next = beginWork(current, unitOfWork, subtreeRenderLanes);
    //     stopProfilerTimerIfRunningAndRecordDelta(unitOfWork, true);
    // } else {
    //     next = beginWork(current, unitOfWork, subtreeRenderLanes);
    // }

    // unitOfWork.memoizedProps = unitOfWork.pendingProps;
    // if (next === null) {
    //     // If this doesn't spawn new work, complete the current work.
    //     completeUnitOfWork(unitOfWork);
    // } else {
    //     workInProgress = next;
    // }

    // ReactCurrentOwner.current = null;
}