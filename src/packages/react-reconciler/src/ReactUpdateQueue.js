export function initializeUpdateQueue(fiber) {
    const queue = {
        baseState: fiber.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: {
            pending: null,
        },
        effects: null,
    };
    fiber.updateQueue = queue;
}

export function createUpdate(eventTime, lane) {
    const update = {
        eventTime,
        lane,

        tag: UpdateState,
        payload: null,
        callback: null,

        next: null,
    };
    return update;
}

export function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue;
    if (updateQueue === null) {
        // Only occurs if the fiber has been unmounted.
        return;
    }

    const sharedQueue = updateQueue.shared;
    const pending = sharedQueue.pending;
    if (pending === null) {
        // This is the first update. Create a circular list.
        update.next = update;
    } else {
        update.next = pending.next;
        pending.next = update;
    }
    sharedQueue.pending = update;
}
/**
 * 
 * @param {Fiber} current 
 * @param {Fiber} workInProgress 
 */
export function cloneUpdateQueue(
    current,
    workInProgress
) {
    // Clone the update queue from current. Unless it's already a clone.
    const queue = workInProgress.updateQueue;
    const currentQueue = current.updateQueue;
    if (queue === currentQueue) {
        const clone = {
            baseState: currentQueue.baseState,
            firstBaseUpdate: currentQueue.firstBaseUpdate,
            lastBaseUpdate: currentQueue.lastBaseUpdate,
            shared: currentQueue.shared,
            effects: currentQueue.effects,
        };
        workInProgress.updateQueue = clone;
    }
}