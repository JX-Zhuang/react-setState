import { ConcurrentRoot, BlockingRoot } from './ReactRootTags';
import {
    NoMode,
    ConcurrentMode,
    DebugTracingMode,
    ProfileMode,
    StrictMode,
    BlockingMode,
} from './ReactTypeOfMode';
import { NoFlags, Placement } from './ReactFiberFlags';
import {
    IndeterminateComponent,
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
    DehydratedFragment,
    FunctionComponent,
    MemoComponent,
    SimpleMemoComponent,
    LazyComponent,
    FundamentalComponent,
    ScopeComponent,
    Block,
    OffscreenComponent,
    LegacyHiddenComponent,
} from './ReactWorkTags';

import {
    REACT_FORWARD_REF_TYPE,
    REACT_FRAGMENT_TYPE,
    REACT_DEBUG_TRACING_MODE_TYPE,
    REACT_STRICT_MODE_TYPE,
    REACT_PROFILER_TYPE,
    REACT_PROVIDER_TYPE,
    REACT_CONTEXT_TYPE,
    REACT_SUSPENSE_TYPE,
    REACT_SUSPENSE_LIST_TYPE,
    REACT_MEMO_TYPE,
    REACT_LAZY_TYPE,
    REACT_FUNDAMENTAL_TYPE,
    REACT_SCOPE_TYPE,
    REACT_BLOCK_TYPE,
    REACT_OFFSCREEN_TYPE,
    REACT_LEGACY_HIDDEN_TYPE,
} from '../../shared/ReactSymbols';

/**
 * 创建 FiberNode
 * @param {*} tag 
 * @param {*} pendingProps 
 * @param {*} key 
 * @param {*} mode 
 */
function FiberNode(
    tag,
    pendingProps,
    key,
    mode,
) {
    // Instance
    this.tag = tag;
    this.key = key;
    this.elementType = null;
    this.type = null;
    this.stateNode = null;

    // Fiber
    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;

    this.ref = null;

    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.updateQueue = null;
    this.memoizedState = null;
    this.dependencies = null;

    this.mode = mode;

    // Effects
    this.flags = NoFlags;
    this.nextEffect = null;

    this.firstEffect = null;
    this.lastEffect = null;

    this.lanes = NoLanes;
    this.childLanes = NoLanes;

    this.alternate = null;
}
const createFiber = function (
    tag,
    pendingProps,
    key
    mode,
) {
    // $FlowFixMe: the shapes are exact here but Flow doesn't like constructors
    return new FiberNode(tag, pendingProps, key, mode);
};


// This is used to create an alternate fiber to do work on.
/**
 * 
 * @param {Fiber} current 
 * @param {any} pendingProps 
 * @returns Fiber
 */
export function createWorkInProgress(current, pendingProps) {
    let workInProgress = current.alternate;
    if (workInProgress === null) {
        // We use a double buffering pooling technique because we know that we'll
        // only ever need at most two versions of a tree. We pool the "other" unused
        // node that we're free to reuse. This is lazily created to avoid allocating
        // extra objects for things that are never updated. It also allow us to
        // reclaim the extra memory if needed.
        workInProgress = createFiber(
            current.tag,
            pendingProps,
            current.key,
            current.mode,
        );
        workInProgress.elementType = current.elementType;
        workInProgress.type = current.type;
        workInProgress.stateNode = current.stateNode;
        workInProgress.alternate = current;
        current.alternate = workInProgress;
    } else {
        workInProgress.pendingProps = pendingProps;
        // Needed because Blocks store data on type.
        workInProgress.type = current.type;

        // We already have an alternate.
        // Reset the effect tag.
        workInProgress.flags = NoFlags;

        // The effect list is no longer valid.
        workInProgress.nextEffect = null;
        workInProgress.firstEffect = null;
        workInProgress.lastEffect = null;
    }

    workInProgress.childLanes = current.childLanes;
    workInProgress.lanes = current.lanes;

    workInProgress.child = current.child;
    workInProgress.memoizedProps = current.memoizedProps;
    workInProgress.memoizedState = current.memoizedState;
    workInProgress.updateQueue = current.updateQueue;

    // Clone the dependencies object. This is mutated during the render phase, so
    // it cannot be shared with the current fiber.
    const currentDependencies = current.dependencies;
    workInProgress.dependencies =
        currentDependencies === null
            ? null
            : {
                lanes: currentDependencies.lanes,
                firstContext: currentDependencies.firstContext,
            };

    // These will be overridden during the parent's reconciliation
    workInProgress.sibling = current.sibling;
    workInProgress.index = current.index;
    workInProgress.ref = current.ref;
    return workInProgress;
}

export function createHostRootFiber(tag) {
    let mode;
    if (tag === ConcurrentRoot) {
        mode = ConcurrentMode | BlockingMode | StrictMode;
    } else if (tag === BlockingRoot) {
        mode = BlockingMode | StrictMode;
    } else {
        mode = NoMode;
    }
    return createFiber(HostRoot, null, null, mode);
}
/**
 * 
 * @param {Function} Component 
 * @returns 
 */
function shouldConstruct(Component) {
    const prototype = Component.prototype;
    return !!(prototype && prototype.isReactComponent);
}
/**
 * 
 * @param {any} type 
 * @param {null | string} key 
 * @param {any} pendingProps 
 * @param {null | Fiber} owner 
 * @param {TypeOfMode} mode 
 * @param {Lanes} lanes 
 * @returns Fiber
 */
export function createFiberFromTypeAndProps(
    type,
    key,
    pendingProps,
    owner,
    mode,
    lanes
) {
    let fiberTag = IndeterminateComponent;
    let resolvedType = type;
    const fiber = createFiber(fiberTag, pendingProps, key, mode);
    fiber.elementType = type;
    fiber.type = resolvedType;
    fiber.lanes = lanes;
    return fiber;
    // // The resolved type is set if we know what the final type will be. I.e. it's not lazy.
    // if (typeof type === 'function') {
    //     if (shouldConstruct(type)) {
    //         //类组件
    //         fiberTag = ClassComponent;
    //     }
    // } else if (typeof type === 'string') {
    //     fiberTag = HostComponent;
    // } else {
    //     switch (type) {
    //         case REACT_FRAGMENT_TYPE:
    //             return createFiberFromFragment(pendingProps.children, mode, lanes, key);
    //         case REACT_DEBUG_TRACING_MODE_TYPE:
    //             fiberTag = Mode;
    //             mode |= DebugTracingMode;
    //             break;
    //         case REACT_STRICT_MODE_TYPE:
    //             fiberTag = Mode;
    //             mode |= StrictMode;
    //             break;
    //         case REACT_PROFILER_TYPE:
    //             return createFiberFromProfiler(pendingProps, mode, lanes, key);
    //         case REACT_SUSPENSE_TYPE:
    //             return createFiberFromSuspense(pendingProps, mode, lanes, key);
    //         case REACT_SUSPENSE_LIST_TYPE:
    //             return createFiberFromSuspenseList(pendingProps, mode, lanes, key);
    //         case REACT_OFFSCREEN_TYPE:
    //             return createFiberFromOffscreen(pendingProps, mode, lanes, key);
    //         case REACT_LEGACY_HIDDEN_TYPE:
    //             return createFiberFromLegacyHidden(pendingProps, mode, lanes, key);
    //         default: {
    //             if (typeof type === 'object' && type !== null) {
    //                 switch (type.$$typeof) {
    //                     case REACT_PROVIDER_TYPE:
    //                         fiberTag = ContextProvider;
    //                         break;
    //                     case REACT_CONTEXT_TYPE:
    //                         // This is a consumer
    //                         fiberTag = ContextConsumer;
    //                         break;
    //                     case REACT_FORWARD_REF_TYPE:
    //                         fiberTag = ForwardRef;
    //                         break;
    //                     case REACT_MEMO_TYPE:
    //                         fiberTag = MemoComponent;
    //                         break;
    //                     case REACT_LAZY_TYPE:
    //                         fiberTag = LazyComponent;
    //                         resolvedType = null;
    //                         break;
    //                     case REACT_BLOCK_TYPE:
    //                         fiberTag = Block;
    //                         break;
    //                     case REACT_FUNDAMENTAL_TYPE:
    //                         if (enableFundamentalAPI) {
    //                             return createFiberFromFundamental(
    //                                 type,
    //                                 pendingProps,
    //                                 mode,
    //                                 lanes,
    //                                 key,
    //                             );
    //                         }
    //                         break;
    //                 }
    //             }
    //             let info = '';
    //         }
    //     }
    // }

    // const fiber = createFiber(fiberTag, pendingProps, key, mode);
    // fiber.elementType = type;
    // fiber.type = resolvedType;
    // fiber.lanes = lanes;
    // return fiber;
}

/**
 * 
 * @param {ReactFragment} elements 
 * @param {TypeOfMode} mode 
 * @param {Lanes} lanes 
 * @param {null | string} key 
 * @returns Fiber
 */
export function createFiberFromFragment(
    elements,
    mode,
    lanes,
    key,
) {
    const fiber = createFiber(Fragment, elements, key, mode);
    fiber.lanes = lanes;
    return fiber;
}

/**
 * 
 * @param {string} content 
 * @param {TypeOfMode} mode 
 * @param {Lanes} lanes 
 * @returns 
 */
export function createFiberFromText(
    content,
    mode,
    lanes
) {
    const fiber = createFiber(HostText, content, null, mode);
    fiber.lanes = lanes;
    return fiber;
}

/**
 * 
 * @param {ReactElement} element 
 * @param {TypeOfMode} mode 
 * @param {Lanes} lanes 
 * @returns Fiber
 */
export function createFiberFromElement(
    element,
    mode,
    lanes: ,
) {
    let owner = null;
    const type = element.type;
    const key = element.key;
    const pendingProps = element.props;
    return createFiberFromTypeAndProps(
        type,
        key,
        pendingProps,
        owner,
        mode,
        lanes,
    );
    // if (__DEV__) {
    //   fiber._debugSource = element._source;
    //   fiber._debugOwner = element._owner;
    // }
    // return fiber;
}