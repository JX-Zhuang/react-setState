
export const SyncLanePriority = 15;
export const SyncBatchedLanePriority = 14;

const InputDiscreteHydrationLanePriority = 13;
export const InputDiscreteLanePriority = 12;

const InputContinuousHydrationLanePriority = 11;
export const InputContinuousLanePriority = 10;

const DefaultHydrationLanePriority = 9;
export const DefaultLanePriority = 8;

const TransitionHydrationPriority = 7;
export const TransitionPriority = 6;

const RetryLanePriority = 5;

const SelectiveHydrationLanePriority = 4;

const IdleHydrationLanePriority = 3;
const IdleLanePriority = 2;

const OffscreenLanePriority = 1;

export const NoLanePriority = 0;

const TotalLanes = 31;

export const NoLanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane = /*                          */ 0b0000000000000000000000000000000;

export const SyncLane = /*                        */ 0b0000000000000000000000000000001;
export const SyncBatchedLane = /*                 */ 0b0000000000000000000000000000010;

export const InputDiscreteHydrationLane = /*      */ 0b0000000000000000000000000000100;
const InputDiscreteLanes = /*                    */ 0b0000000000000000000000000011000;

const InputContinuousHydrationLane = /*           */ 0b0000000000000000000000000100000;
const InputContinuousLanes = /*                  */ 0b0000000000000000000000011000000;

export const DefaultHydrationLane = /*            */ 0b0000000000000000000000100000000;
export const DefaultLanes = /*                   */ 0b0000000000000000000111000000000;

const TransitionHydrationLane = /*                */ 0b0000000000000000001000000000000;
const TransitionLanes = /*                       */ 0b0000000001111111110000000000000;

const RetryLanes = /*                            */ 0b0000011110000000000000000000000;

export const SomeRetryLane = /*                  */ 0b0000010000000000000000000000000;

export const SelectiveHydrationLane = /*          */ 0b0000100000000000000000000000000;

const NonIdleLanes = /*                                 */ 0b0000111111111111111111111111111;

export const IdleHydrationLane = /*               */ 0b0001000000000000000000000000000;
const IdleLanes = /*                             */ 0b0110000000000000000000000000000;

export const OffscreenLane = /*                   */ 0b1000000000000000000000000000000;

export const NoTimestamp = -1;
export function markRootUpdated() { }
export function mergeLanes(a, b) {
    return a | b;
}
export function includesSomeLane(a, b:) {
    return (a & b) !== NoLanes;
}

export function removeLanes(set, subset) {
    return set & ~subset;
}
