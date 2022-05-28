import {
    NoLane,
    NoLanes,
    // InputContinuousLanePriority,
    // isSubsetOfLanes,
    // mergeLanes,
    removeLanes,
    // markRootEntangled,
    // markRootMutableRead,
    // getCurrentUpdateLanePriority,
    // setCurrentUpdateLanePriority,
    // higherLanePriority,
    // DefaultLanePriority,
} from './ReactFiberLane';

let workInProgressHook = null;
let didScheduleRenderPhaseUpdate = false;
let renderLanes = NoLanes;
let currentlyRenderingFiber = null;
/**
 * 
 * @param {Fiber|null} current 
 * @param {Fiber} workInProgress 
 * @param {(p: Props, arg: SecondArg) => any} Component 
 * @param {Props} props 
 * @param {SecondArg} secondArg 
 * @param {Lanes} nextRenderLanes 
 * @returns 
 */
export function renderWithHooks(
    current,
    workInProgress,
    Component,
    props,
    secondArg,
    nextRenderLanes
) {
    renderLanes = nextRenderLanes;
    currentlyRenderingFiber = workInProgress;
    workInProgress.memoizedState = null;
    workInProgress.updateQueue = null;
    workInProgress.lanes = NoLanes;

    // 暂时忽略
    // ReactCurrentDispatcher.current =
    //     current === null || current.memoizedState === null
    //         ? HooksDispatcherOnMount
    //         : HooksDispatcherOnUpdate;

    let children = Component(props, secondArg);

    // Check if there was a render phase update
    if (didScheduleRenderPhaseUpdateDuringThisPass) {
        // Keep rendering in a loop for as long as render phase updates continue to
        // be scheduled. Use a counter to prevent infinite loops.
        let numberOfReRenders = 0;
        do {
            didScheduleRenderPhaseUpdateDuringThisPass = false;

            numberOfReRenders += 1;

            // Start over from the beginning of the list
            currentHook = null;
            workInProgressHook = null;

            workInProgress.updateQueue = null;

            // 暂时忽略
            // ReactCurrentDispatcher.current = HooksDispatcherOnRerender;

            children = Component(props, secondArg);
        } while (didScheduleRenderPhaseUpdateDuringThisPass);
    }

    // We can assume the previous dispatcher is always this one, since we set it
    // at the beginning of the render phase and there's no re-entrancy.
    // 暂时忽略
    // ReactCurrentDispatcher.current = ContextOnlyDispatcher;
    // This check uses currentHook so that it works the same in DEV and prod bundles.
    // hookTypesDev could catch more cases (e.g. context) but only in DEV bundles.
    const didRenderTooFewHooks =
        currentHook !== null && currentHook.next !== null;

    renderLanes = NoLanes;
    currentlyRenderingFiber = null;
    currentHook = null;
    workInProgressHook = null;
    didScheduleRenderPhaseUpdate = false;
    return children;
}

/**
 * 
 * @param {Fiber} current 
 * @param {Fiber} workInProgress 
 * @param {Lanes} lanes 
 */
export function bailoutHooks(
    current,
    workInProgress,
    lanes
) {
    workInProgress.updateQueue = current.updateQueue;
    workInProgress.flags &= ~(PassiveEffect | UpdateEffect);
    current.lanes = removeLanes(current.lanes, lanes);
}