import { createCursor } from './ReactFiberStack';
export const emptyContextObject = {};
const contextStackCursor = createCursor(
    emptyContextObject
);
let previousContext = emptyContextObject;

/**
 * 
 * @param {Fiber} workInProgress 
 * @param {Object} unmaskedContext 
 * @param {Object} maskedContext 
 * @returns 
 */
function cacheContext(
    workInProgress,
    unmaskedContext,
    maskedContext,
) {
    const instance = workInProgress.stateNode;
    instance.__reactInternalMemoizedUnmaskedChildContext = unmaskedContext;
    instance.__reactInternalMemoizedMaskedChildContext = maskedContext;
}

/**
 * 
 * @param {Fiber} workInProgress 
 * @param {Object} unmaskedContext 
 * @returns  Object
 */
function getMaskedContext(
    workInProgress,
    unmaskedContext
) {
    const type = workInProgress.type;
    const contextTypes = type.contextTypes;
    if (!contextTypes) {
        return emptyContextObject;
    }

    // Avoid recreating masked context unless unmasked context has changed.
    // Failing to do this will result in unnecessary calls to componentWillReceiveProps.
    // This may trigger infinite loops if componentWillReceiveProps calls setState.
    const instance = workInProgress.stateNode;
    if (
        instance &&
        instance.__reactInternalMemoizedUnmaskedChildContext === unmaskedContext
    ) {
        return instance.__reactInternalMemoizedMaskedChildContext;
    }

    const context = {};
    for (const key in contextTypes) {
        context[key] = unmaskedContext[key];
    }
    // Cache unmasked context so we can avoid recreating masked context unless necessary.
    // Context is created before the class component is instantiated so check for instance.
    if (instance) {
        cacheContext(workInProgress, unmaskedContext, context);
    }

    return context;
}

/**
 * 
 * @param {Function} type 
 * @returns boolean
 */
function isContextProvider(type) {
    const childContextTypes = type.childContextTypes;
    return childContextTypes !== null && childContextTypes !== undefined;
}

/**
 * 
 * @param {Fiber} workInProgress 
 * @param {Function} Component 
 * @param {boolean} didPushOwnContextIfProvider 
 * @returns 
 */
function getUnmaskedContext(
    workInProgress,
    Component,
    didPushOwnContextIfProvider
) {
    if (didPushOwnContextIfProvider && isContextProvider(Component)) {
        return previousContext;
    }
    return contextStackCursor.current;
}

export {
    getUnmaskedContext,
    isContextProvider,
    getMaskedContext,
    cacheContext
}