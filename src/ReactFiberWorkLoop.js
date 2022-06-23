import { ClassComponent, HostRoot } from "./ReactWorkTag";
import { SyncLane } from './ReactFiberLane';
import { ConcurrentMode, NoMode } from './ReactTypeOfMode';
let NoLanePriority = 0;
let SyncLanePriority = 12;
let syncQueue = [];
let NoContext = 0;
let BatchedContext = 1;
let executionContext = NoContext;
export function scheduleUpdateOnFiber(fiber) {
    let root = markUpdateLaneFromFiberToRoot(fiber);
    //开始创建一个任务，从根节点开始进行更新
    ensureRootIsScheduled(root);
    //如果当前的执行上下文环境是NoContext（非批量），并且mode不是并发的话
    if (executionContext === NoContext && (fiber.mode & ConcurrentMode) === NoMode) {
        debugger
        flushSyncCallbackQueue();
    }
}
export function batchedUpdates(fn) {
    let prevExecutionContext = executionContext;
    executionContext |= BatchedContext;
    fn();
    executionContext = prevExecutionContext;
}
function ensureRootIsScheduled(root) {
    let nextLanes = SyncLane;
    let newCallbackPriority = SyncLanePriority;//按理说应该等于最高级别赛道的优先级
    let existingCallbackPriority = root.callbackPriority;//当前根节点上正在执行的更新任务的优先级
    if (existingCallbackPriority === newCallbackPriority) {
        // 也是并发模式，即使在setTimeout里也批量更新的原因
        // 如果新的更新和当前根节点的已经调度的更新相等
        // 直接返回，复用上次的更新，不再创建新的更新
        return;
    }
    scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    queueMicrotask(flushSyncCallbackQueue);
    root.callbackPriority = newCallbackPriority;
}

function flushSyncCallbackQueue() {
    syncQueue.forEach(cb => cb());
    syncQueue.length = 0;
}

//调度
//把 performSyncWorkOnRoot 添加到一个队列里，等待执行
function scheduleSyncCallback(callback) {
    syncQueue.push(callback);
}
//调合
//真正渲染任务，比较新老节点，得到dom-diff的结果，更新dom
function performSyncWorkOnRoot(workInProgress) {
    let root = workInProgress;
    while (workInProgress) {
        if (workInProgress.tag === ClassComponent) {
            let inst = workInProgress.stateNode;
            inst.state = processUpdateQueue(inst, workInProgress);
            //得到新状态，调用render得到新的虚拟dom，更新dom
            inst.render();
        }
        workInProgress = workInProgress.child;
    }
    commitRoot(root);
}
function commitRoot(root) {
    root.callbackPriority = NoLanePriority;
}
//根据老状态和更新队列计算新状态
function processUpdateQueue(inst, fiber) {
    return fiber.updateQueue.reduce((state, { payload }) => {
        if (typeof payload === 'function') {
            payload = payload(state);
        }
        return {
            ...state,
            ...payload
        };
    }, inst.state);
}

function markUpdateLaneFromFiberToRoot(fiber) {
    let parent = fiber.return;
    while (parent) {
        fiber = parent;
        parent = fiber.return;
    }
    if (fiber.tag === HostRoot) {
        return fiber;
    }
    return null;
}