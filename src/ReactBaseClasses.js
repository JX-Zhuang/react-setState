import { SyncLane } from "./ReactFiberLane";
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';
let classComponentUpdater = {
    enqueueSetState(inst, payload) {
        let fiber = get(inst);
        let eventTime = requestEventTime();
        let lane = requestUpdateLane(fiber); //计算本次更新的优先级
        // eventTime计算超时时间，lane计算任务优先级
        let update = createUpdate(eventTime, lane);    //创建新的更新对象
        update.payload = payload; //{number:1}
        enqueueUpdate(fiber, update);
        scheduleUpdateOnFiber(fiber);
    }
};

function enqueueUpdate(fiber, update) {
    fiber.updateQueue.push(update); //源码里是链表

}

function createUpdate(eventTime, lane) {
    return {
        eventTime, lane
    };
}
function requestUpdateLane(fiber) {
    return SyncLane;
}
function requestEventTime() {
    //程序从启动到现在的时间，是用来计算任务的过期的
    return performance.now();
}
function get(inst) {
    return inst._reactInternals;
}
export class Component {
    constructor() {
        this.updater = classComponentUpdater;
    }
    setState(partialState) {
        this.updater.enqueueSetState(this, partialState);
    }
}
