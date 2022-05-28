import { initializeUpdateQueue } from './ReactUpdateQueue';
import { createHostRootFiber } from './ReactFiber';
function FiberRootNode(containerInfo, tag, hydrate) {
    this.tag = tag;
    this.containerInfo = containerInfo;
    this.pendingChildren = null;
    // The currently active root fiber. This is the mutable root of the tree.
    this.current = null;
    this.pingCache = null;
    this.finishedWork = null;
    this.timeoutHandle = noTimeout;
    this.context = null;
    this.pendingContext = null;
    this.hydrate = hydrate;
    this.callbackNode = null;
    this.callbackPriority = NoLanePriority;
    this.eventTimes = createLaneMap(NoLanes);
    this.expirationTimes = createLaneMap(NoTimestamp);

    this.pendingLanes = NoLanes;
    this.suspendedLanes = NoLanes;
    this.pingedLanes = NoLanes;
    this.expiredLanes = NoLanes;
    this.mutableReadLanes = NoLanes;
    this.finishedLanes = NoLanes;

    this.entangledLanes = NoLanes;
    this.entanglements = createLaneMap(NoLanes);

    if (supportsHydration) {
        this.mutableSourceEagerHydrationData = null;
    }

    if (enableSchedulerTracing) {
        this.interactionThreadID = unstable_getThreadID();
        this.memoizedInteractions = new Set();
        this.pendingInteractionMap = new Map();
    }
    if (enableSuspenseCallback) {
        this.hydrationCallbacks = null;
    }
}
export function createFiberRoot(
    containerInfo,
    tag,
    hydrate,
    hydrationCallbacks
) {
    // root是 FiberRootNode 的实例
    const root = new FiberRootNode(containerInfo, tag, hydrate);
    // Cyclic construction. This cheats the type system right now because
    // stateNode is any.
    const uninitializedFiber = createHostRootFiber(tag);    //fiber
    // root.current是 FiberNode 的实例
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;

    initializeUpdateQueue(uninitializedFiber);

    return root;
}