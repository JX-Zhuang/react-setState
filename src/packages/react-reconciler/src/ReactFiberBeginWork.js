import {
    IndeterminateComponent,
    FunctionComponent,
    ClassComponent,
    HostRoot,
    HostComponent,
    HostText,
    HostPortal,
    ForwardRef,
    Fragment,
    Mode,
    ContextProvider,
    ContextConsumer,
    Profiler,
    SuspenseComponent,
    SuspenseListComponent,
    MemoComponent,
    SimpleMemoComponent,
    LazyComponent,
    IncompleteClassComponent,
    FundamentalComponent,
    ScopeComponent,
    Block,
    OffscreenComponent,
    LegacyHiddenComponent,
} from './ReactWorkTags';
import {
    NoLane,
    NoLanes,
    SyncLane,
    OffscreenLane,
    DefaultHydrationLane,
    SomeRetryLane,
    NoTimestamp,
    includesSomeLane,
    // laneToLanes,
    // removeLanes,
    mergeLanes,
    // getBumpedLaneForHydration,
} from './ReactFiberLane';
import {
    mountChildFibers,
    reconcileChildFibers,
    cloneChildFibers,
} from './ReactChildFiber';
import {
    NoFlags,
    PerformedWork,
    Placement,
    Hydrating,
    ContentReset,
    DidCapture,
    Update,
    Ref,
    Deletion,
    ForceUpdateForLegacySuspense,
} from './ReactFiberFlags';

import { renderWithHooks, bailoutHooks } from './ReactFiberHooks';
import { resolveDefaultProps } from './ReactFiberLazyComponent';
import {
    // processUpdateQueue,
    cloneUpdateQueue,
    // initializeUpdateQueue,
} from './ReactUpdateQueue';
import {
    getMaskedContext,
    getUnmaskedContext,
    hasContextChanged as hasLegacyContextChanged,
    pushContextProvider as pushLegacyContextProvider,
    isContextProvider as isLegacyContextProvider,
    pushTopLevelContextObject,
    invalidateContextProvider,
} from './ReactFiberContext';
let didReceiveUpdate = false;

function updateFunctionComponent(
    current,
    workInProgress,
    Component,
    nextProps,
    renderLanes,
) {

    let context;
    const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
    context = getMaskedContext(workInProgress, unmaskedContext);

    let nextChildren;
    // prepareToReadContext(workInProgress, renderLanes);
    nextChildren = renderWithHooks(
        current,
        workInProgress,
        Component,
        nextProps,
        context,
        renderLanes,
    );

    if (current !== null && !didReceiveUpdate) {
        bailoutHooks(current, workInProgress, renderLanes);
        return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }

    // React DevTools reads this flag.
    workInProgress.flags |= PerformedWork;
    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    return workInProgress.child;
}

/**
 * 
 * @param {*} current Fiber
 * @param {*} workInProgress Fiber
 * @param {*} renderLanes 
 * @returns Fiber|null
 */
function beginWork(
    current,
    workInProgress,
    renderLanes
) {
    return updateHostRoot(current, workInProgress, renderLanes);

    // 暂时忽略

    // const updateLanes = workInProgress.lanes;

    // if (current !== null) {
    //     const oldProps = current.memoizedProps;
    //     const newProps = workInProgress.pendingProps;

    //     if (
    //         oldProps !== newProps
    //         //  || hasLegacyContextChanged() 暂时忽略
    //     ) {
    //         // If props or context changed, mark the fiber as having performed work.
    //         // This may be unset if the props are determined to be equal later (memo).
    //         didReceiveUpdate = true;
    //     } else if (!includesSomeLane(renderLanes, updateLanes)) {
    //         didReceiveUpdate = false;
    //         // This fiber does not have any pending work. Bailout without entering
    //         // the begin phase. There's still some bookkeeping we that needs to be done
    //         // in this optimized path, mostly pushing stuff onto the stack.

    //         // 暂时忽略 switch 的逻辑
    //         // switch (workInProgress.tag) {
    //         //     case HostRoot:
    //         //         pushHostRootContext(workInProgress);
    //         //         resetHydrationState();
    //         //         break;
    //         //     case HostComponent:
    //         //         pushHostContext(workInProgress);
    //         //         break;
    //         //     case ClassComponent: {
    //         //         const Component = workInProgress.type;
    //         //         if (isLegacyContextProvider(Component)) {
    //         //             pushLegacyContextProvider(workInProgress);
    //         //         }
    //         //         break;
    //         //     }
    //         //     case HostPortal:
    //         //         pushHostContainer(
    //         //             workInProgress,
    //         //             workInProgress.stateNode.containerInfo,
    //         //         );
    //         //         break;
    //         //     case ContextProvider: {
    //         //         const newValue = workInProgress.memoizedProps.value;
    //         //         pushProvider(workInProgress, newValue);
    //         //         break;
    //         //     }
    //         //     case Profiler:
    //         //         if (enableProfilerTimer) {
    //         //             // Profiler should only call onRender when one of its descendants actually rendered.
    //         //             const hasChildWork = includesSomeLane(
    //         //                 renderLanes,
    //         //                 workInProgress.childLanes,
    //         //             );
    //         //             if (hasChildWork) {
    //         //                 workInProgress.flags |= Update;
    //         //             }

    //         //             // Reset effect durations for the next eventual effect phase.
    //         //             // These are reset during render to allow the DevTools commit hook a chance to read them,
    //         //             const stateNode = workInProgress.stateNode;
    //         //             stateNode.effectDuration = 0;
    //         //             stateNode.passiveEffectDuration = 0;
    //         //         }
    //         //         break;
    //         //     case SuspenseComponent: {
    //         //         const state: SuspenseState | null = workInProgress.memoizedState;
    //         //         if (state !== null) {
    //         //             if (enableSuspenseServerRenderer) {
    //         //                 if (state.dehydrated !== null) {
    //         //                     pushSuspenseContext(
    //         //                         workInProgress,
    //         //                         setDefaultShallowSuspenseContext(suspenseStackCursor.current),
    //         //                     );
    //         //                     // We know that this component will suspend again because if it has
    //         //                     // been unsuspended it has committed as a resolved Suspense component.
    //         //                     // If it needs to be retried, it should have work scheduled on it.
    //         //                     workInProgress.flags |= DidCapture;
    //         //                     // We should never render the children of a dehydrated boundary until we
    //         //                     // upgrade it. We return null instead of bailoutOnAlreadyFinishedWork.
    //         //                     return null;
    //         //                 }
    //         //             }

    //         //             // If this boundary is currently timed out, we need to decide
    //         //             // whether to retry the primary children, or to skip over it and
    //         //             // go straight to the fallback. Check the priority of the primary
    //         //             // child fragment.
    //         //             const primaryChildFragment: Fiber = (workInProgress.child: any);
    //         //             const primaryChildLanes = primaryChildFragment.childLanes;
    //         //             if (includesSomeLane(renderLanes, primaryChildLanes)) {
    //         //                 // The primary children have pending work. Use the normal path
    //         //                 // to attempt to render the primary children again.
    //         //                 return updateSuspenseComponent(
    //         //                     current,
    //         //                     workInProgress,
    //         //                     renderLanes,
    //         //                 );
    //         //             } else {
    //         //                 // The primary child fragment does not have pending work marked
    //         //                 // on it
    //         //                 pushSuspenseContext(
    //         //                     workInProgress,
    //         //                     setDefaultShallowSuspenseContext(suspenseStackCursor.current),
    //         //                 );
    //         //                 // The primary children do not have pending work with sufficient
    //         //                 // priority. Bailout.
    //         //                 const child = bailoutOnAlreadyFinishedWork(
    //         //                     current,
    //         //                     workInProgress,
    //         //                     renderLanes,
    //         //                 );
    //         //                 if (child !== null) {
    //         //                     // The fallback children have pending work. Skip over the
    //         //                     // primary children and work on the fallback.
    //         //                     return child.sibling;
    //         //                 } else {
    //         //                     return null;
    //         //                 }
    //         //             }
    //         //         } else {
    //         //             pushSuspenseContext(
    //         //                 workInProgress,
    //         //                 setDefaultShallowSuspenseContext(suspenseStackCursor.current),
    //         //             );
    //         //         }
    //         //         break;
    //         //     }
    //         //     case SuspenseListComponent: {
    //         //         const didSuspendBefore = (current.flags & DidCapture) !== NoFlags;

    //         //         const hasChildWork = includesSomeLane(
    //         //             renderLanes,
    //         //             workInProgress.childLanes,
    //         //         );

    //         //         if (didSuspendBefore) {
    //         //             if (hasChildWork) {
    //         //                 // If something was in fallback state last time, and we have all the
    //         //                 // same children then we're still in progressive loading state.
    //         //                 // Something might get unblocked by state updates or retries in the
    //         //                 // tree which will affect the tail. So we need to use the normal
    //         //                 // path to compute the correct tail.
    //         //                 return updateSuspenseListComponent(
    //         //                     current,
    //         //                     workInProgress,
    //         //                     renderLanes,
    //         //                 );
    //         //             }
    //         //             // If none of the children had any work, that means that none of
    //         //             // them got retried so they'll still be blocked in the same way
    //         //             // as before. We can fast bail out.
    //         //             workInProgress.flags |= DidCapture;
    //         //         }

    //         //         // If nothing suspended before and we're rendering the same children,
    //         //         // then the tail doesn't matter. Anything new that suspends will work
    //         //         // in the "together" mode, so we can continue from the state we had.
    //         //         const renderState = workInProgress.memoizedState;
    //         //         if (renderState !== null) {
    //         //             // Reset to the "together" mode in case we've started a different
    //         //             // update in the past but didn't complete it.
    //         //             renderState.rendering = null;
    //         //             renderState.tail = null;
    //         //             renderState.lastEffect = null;
    //         //         }
    //         //         pushSuspenseContext(workInProgress, suspenseStackCursor.current);

    //         //         if (hasChildWork) {
    //         //             break;
    //         //         } else {
    //         //             // If none of the children had any work, that means that none of
    //         //             // them got retried so they'll still be blocked in the same way
    //         //             // as before. We can fast bail out.
    //         //             return null;
    //         //         }
    //         //     }
    //         //     case OffscreenComponent:
    //         //     case LegacyHiddenComponent: {
    //         //         // Need to check if the tree still needs to be deferred. This is
    //         //         // almost identical to the logic used in the normal update path,
    //         //         // so we'll just enter that. The only difference is we'll bail out
    //         //         // at the next level instead of this one, because the child props
    //         //         // have not changed. Which is fine.
    //         //         // TODO: Probably should refactor `beginWork` to split the bailout
    //         //         // path from the normal path. I'm tempted to do a labeled break here
    //         //         // but I won't :)
    //         //         workInProgress.lanes = NoLanes;
    //         //         return updateOffscreenComponent(current, workInProgress, renderLanes);
    //         //     }
    //         // }

    //         // 本`fiber`节点的没有更新, 可以复用, 进入bailout逻辑
    //         return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    //     } else {
    //         if ((current.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
    //             // This is a special case that only exists for legacy mode.
    //             // See https://github.com/facebook/react/pull/19216.
    //             didReceiveUpdate = true;
    //         } else {
    //             // An update was scheduled on this fiber, but there are no new props
    //             // nor legacy context. Set this to false. If an update queue or context
    //             // consumer produces a changed value, it will set this to true. Otherwise,
    //             // the component will assume the children have not changed and bail out.
    //             didReceiveUpdate = false;
    //         }
    //     }
    // } else {
    //     didReceiveUpdate = false;
    // }

    // // Before entering the begin phase, clear pending update priority.
    // // TODO: This assumes that we're about to evaluate the component and process
    // // the update queue. However, there's an exception: SimpleMemoComponent
    // // sometimes bails out later in the begin phase. This indicates that we should
    // // move this assignment out of the common path and into each branch.
    // workInProgress.lanes = NoLanes;

    // switch (workInProgress.tag) {
    //     case FunctionComponent: {
    //         const Component = workInProgress.type;
    //         const unresolvedProps = workInProgress.pendingProps;
    //         const resolvedProps =
    //             workInProgress.elementType === Component
    //                 ? unresolvedProps
    //                 : resolveDefaultProps(Component, unresolvedProps);
    //         return updateFunctionComponent(
    //             current,
    //             workInProgress,
    //             Component,
    //             resolvedProps,
    //             renderLanes,
    //         );
    //     }
    //     case HostRoot:
    //         // 第一次加载
    //         return updateHostRoot(current, workInProgress, renderLanes);
    //     case HostComponent:
    //         return updateHostComponent(current, workInProgress, renderLanes);
    //     case HostText:
    //         return updateHostText(current, workInProgress);

    //     // case IndeterminateComponent: {
    //     //     return mountIndeterminateComponent(
    //     //         current,
    //     //         workInProgress,
    //     //         workInProgress.type,
    //     //         renderLanes,
    //     //     );
    //     // }
    //     // case LazyComponent: {
    //     //     const elementType = workInProgress.elementType;
    //     //     return mountLazyComponent(
    //     //         current,
    //     //         workInProgress,
    //     //         elementType,
    //     //         updateLanes,
    //     //         renderLanes,
    //     //     );
    //     // }

    //     // case ClassComponent: {
    //     //     const Component = workInProgress.type;
    //     //     const unresolvedProps = workInProgress.pendingProps;
    //     //     const resolvedProps =
    //     //         workInProgress.elementType === Component
    //     //             ? unresolvedProps
    //     //             : resolveDefaultProps(Component, unresolvedProps);
    //     //     return updateClassComponent(
    //     //         current,
    //     //         workInProgress,
    //     //         Component,
    //     //         resolvedProps,
    //     //         renderLanes,
    //     //     );
    //     // }

    //     // case SuspenseComponent:
    //     //     return updateSuspenseComponent(current, workInProgress, renderLanes);

    //     // case HostPortal:
    //     //     return updatePortalComponent(current, workInProgress, renderLanes);

    //     // case ForwardRef: {
    //     //     const type = workInProgress.type;
    //     //     const unresolvedProps = workInProgress.pendingProps;
    //     //     const resolvedProps =
    //     //         workInProgress.elementType === type
    //     //             ? unresolvedProps
    //     //             : resolveDefaultProps(type, unresolvedProps);
    //     //     return updateForwardRef(
    //     //         current,
    //     //         workInProgress,
    //     //         type,
    //     //         resolvedProps,
    //     //         renderLanes,
    //     //     );
    //     // }

    //     // case Fragment:
    //     //     return updateFragment(current, workInProgress, renderLanes);
    //     // case Mode:
    //     //     return updateMode(current, workInProgress, renderLanes);
    //     // case Profiler:
    //     //     return updateProfiler(current, workInProgress, renderLanes);
    //     // case ContextProvider:
    //     //     return updateContextProvider(current, workInProgress, renderLanes);
    //     // case ContextConsumer:
    //     //     return updateContextConsumer(current, workInProgress, renderLanes);
    //     // case MemoComponent: {
    //     //     const type = workInProgress.type;
    //     //     const unresolvedProps = workInProgress.pendingProps;
    //     //     // Resolve outer props first, then resolve inner props.
    //     //     let resolvedProps = resolveDefaultProps(type, unresolvedProps);
    //     //     resolvedProps = resolveDefaultProps(type.type, resolvedProps);
    //     //     return updateMemoComponent(
    //     //         current,
    //     //         workInProgress,
    //     //         type,
    //     //         resolvedProps,
    //     //         updateLanes,
    //     //         renderLanes,
    //     //     );
    //     // }
    //     // case SimpleMemoComponent: {
    //     //     return updateSimpleMemoComponent(
    //     //         current,
    //     //         workInProgress,
    //     //         workInProgress.type,
    //     //         workInProgress.pendingProps,
    //     //         updateLanes,
    //     //         renderLanes,
    //     //     );
    //     // }
    //     // case IncompleteClassComponent: {
    //     //     const Component = workInProgress.type;
    //     //     const unresolvedProps = workInProgress.pendingProps;
    //     //     const resolvedProps =
    //     //         workInProgress.elementType === Component
    //     //             ? unresolvedProps
    //     //             : resolveDefaultProps(Component, unresolvedProps);
    //     //     return mountIncompleteClassComponent(
    //     //         current,
    //     //         workInProgress,
    //     //         Component,
    //     //         resolvedProps,
    //     //         renderLanes,
    //     //     );
    //     // }
    //     // case SuspenseListComponent: {
    //     //     return updateSuspenseListComponent(current, workInProgress, renderLanes);
    //     // }
    //     case FundamentalComponent: {
    //         break;
    //     }
    //     case ScopeComponent: {
    //         break;
    //     }
    //     case Block: {
    //         break;
    //     }
    //     // case OffscreenComponent: {
    //     //     return updateOffscreenComponent(current, workInProgress, renderLanes);
    //     // }
    //     // case LegacyHiddenComponent: {
    //     //     return updateLegacyHiddenComponent(current, workInProgress, renderLanes);
    //     // }
    // }
}


/**
 * 
 * @param {*} current : Fiber | null
 * @param {*} workInProgress : Fiber
 * @param {*} renderLanes : Lanes
 * @returns  Fiber | null
 */
function bailoutOnAlreadyFinishedWork(
    current,
    workInProgress,
    renderLanes
) {
    if (current !== null) {
        // Reuse previous dependencies
        workInProgress.dependencies = current.dependencies;
    }

    if (enableProfilerTimer) {
        // Don't update "base" render times for bailouts.
        stopProfilerTimerIfRunning(workInProgress);
    }

    markSkippedUpdateLanes(workInProgress.lanes);

    // Check if the children have any pending work.
    if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
        // The children don't have any work either. We can skip them.
        // TODO: Once we add back resuming, we should check if the children are
        // a work-in-progress set. If so, we need to transfer their effects.
        return null;
    } else {
        // This fiber doesn't have work, but its subtree does. Clone the child
        // fibers and continue.
        cloneChildFibers(current, workInProgress);
        return workInProgress.child;
    }
}

/**
 * 
 * @param {*} current 
 * @param {*} workInProgress 
 * @param {*} renderLanes 
 * @returns 
 */
function updateHostRoot(current, workInProgress, renderLanes) {

    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    return workInProgress.child

    // 暂时忽略
    // pushHostRootContext(workInProgress);

    // const updateQueue = workInProgress.updateQueue;
    // const nextProps = workInProgress.pendingProps;
    // const prevState = workInProgress.memoizedState;
    // const prevChildren = prevState !== null ? prevState.element : null;
    // cloneUpdateQueue(current, workInProgress);

    // // processUpdateQueue(workInProgress, nextProps, null, renderLanes);

    // const nextState = workInProgress.memoizedState;
    // // Caution: React DevTools currently depends on this property
    // // being called "element".
    // const nextChildren = nextState.element;
    // if (nextChildren === prevChildren) {
    //     return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    // }
    // const root = workInProgress.stateNode; //FiberRoot
    // // Otherwise reset hydration state in case we aborted and resumed another
    // // root.
    // reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    // return workInProgress.child;
}

/**
 * 
 * @param {*} current : Fiber | null
 * @param {*} workInProgress : Fiber
 * @param {*} nextChildren : any
 * @param {*} renderLanes : Lanes
 */
export function reconcileChildren(
    current,
    workInProgress,
    nextChildren,
    renderLanes
) {
    // workInProgress.child = firstChild
    if (current === null) {
        workInProgress.child = mountChildFibers(
            workInProgress,
            null,
            nextChildren,
            renderLanes,
        );
    } else {
        workInProgress.child = reconcileChildFibers(
            workInProgress,
            current.child,
            nextChildren,
            renderLanes,
        );
    }
}

export { beginWork };