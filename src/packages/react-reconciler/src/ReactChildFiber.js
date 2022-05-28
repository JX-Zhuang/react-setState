import { Placement, Deletion } from './ReactFiberFlags';
import {
    getIteratorFn,
    REACT_ELEMENT_TYPE,
    REACT_FRAGMENT_TYPE,
    REACT_PORTAL_TYPE,
    REACT_LAZY_TYPE,
    REACT_BLOCK_TYPE,
} from '../../shared/ReactSymbols';
import {
    FunctionComponent,
    ClassComponent,
    HostText,
    HostPortal,
    ForwardRef,
    Fragment,
    SimpleMemoComponent,
    Block
} from './ReactWorkTags';
import {
    createWorkInProgress,
    // resetWorkInProgress,
    createFiberFromElement,
    createFiberFromFragment,
    createFiberFromText,
    // createFiberFromPortal,
} from './ReactFiber'

/**
 * 
 * @param {boolean} shouldTrackSideEffects
 */
function ChildReconciler(shouldTrackSideEffects) {

    /**
     * 
     * @param {Fiber} returnFiber 
     * @param {any} newChild 
     * @param {Lanes} lanes 
     * @returns Fiber|null
     */
    function createChild(
        returnFiber,
        newChild,
        lanes,
    ) {
        if (typeof newChild === 'string' || typeof newChild === 'number') {
            const created = createFiberFromText(
                '' + newChild,
                returnFiber.mode,
                lanes,
            );
            created.return = returnFiber;
            return created;
        }

        if (typeof newChild === 'object' && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    const created = createFiberFromElement(
                        newChild,
                        returnFiber.mode,
                        lanes,
                    );
                    // created.ref = coerceRef(returnFiber, null, newChild);
                    created.return = returnFiber;
                    return created;
                }
                // case REACT_PORTAL_TYPE: {
                //     const created = createFiberFromPortal(
                //         newChild,
                //         returnFiber.mode,
                //         lanes,
                //     );
                //     created.return = returnFiber;
                //     return created;
                // }
                // case REACT_LAZY_TYPE: {
                //     if (enableLazyElements) {
                //         const payload = newChild._payload;
                //         const init = newChild._init;
                //         return createChild(returnFiber, init(payload), lanes);
                //     }
                // }
            }

            if (isArray(newChild) || getIteratorFn(newChild)) {
                const created = createFiberFromFragment(
                    newChild,
                    returnFiber.mode,
                    lanes,
                    null,
                );
                created.return = returnFiber;
                return created;
            }
        }
        return null;
    }
    /**
     * 
     * @param {Fiber} returnFiber 父Fiber
     * @param {Fiber | null} current 
     * @param {string} textContent 
     * @param {Lanes} lanes 
     * @returns 
     */
    function updateTextNode(
        returnFiber,
        current,
        textContent,
        lanes
    ) {
        // newFiber.return = returnFiber; 新Fiber的return赋值为父Fiber
        if (current === null || current.tag !== HostText) {
            // Insert
            const created = createFiberFromText(textContent, returnFiber.mode, lanes);
            created.return = returnFiber;
            return created;
        } else {
            // Update
            const existing = useFiber(current, textContent);
            existing.return = returnFiber;
            return existing;
        }
    }
    /**
     * 
     * @param {Fiber} returnFiber 
     * @param {Fiber | null} oldFiber 
     * @param {any} newChild 
     * @param {Lanes} lanes 
     * @returns Fiber|null
     */
    function updateSlot(
        returnFiber,
        oldFiber,
        newChild,
        lanes
    ) {
        // Update the fiber if the keys match, otherwise return null.

        const key = oldFiber !== null ? oldFiber.key : null;

        if (typeof newChild === 'string' || typeof newChild === 'number') {
            // Text nodes don't have keys. If the previous node is implicitly keyed
            // we can continue to replace it without aborting even if it is not a text
            // node.
            if (key !== null) {
                return null;
            }
            return updateTextNode(returnFiber, oldFiber, '' + newChild, lanes);
        }

        if (typeof newChild === 'object' && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    if (newChild.key === key) {
                        if (newChild.type === REACT_FRAGMENT_TYPE) {
                            return updateFragment(
                                returnFiber,
                                oldFiber,
                                newChild.props.children,
                                lanes,
                                key,
                            );
                        }
                        return updateElement(returnFiber, oldFiber, newChild, lanes);
                    } else {
                        return null;
                    }
                }
                case REACT_PORTAL_TYPE: {
                    if (newChild.key === key) {
                        return updatePortal(returnFiber, oldFiber, newChild, lanes);
                    } else {
                        return null;
                    }
                }
                // case REACT_LAZY_TYPE: {
                //     if (enableLazyElements) {
                //         const payload = newChild._payload;
                //         const init = newChild._init;
                //         return updateSlot(returnFiber, oldFiber, init(payload), lanes);
                //     }
                // }
            }

            if (isArray(newChild) || getIteratorFn(newChild)) {
                if (key !== null) {
                    return null;
                }

                return updateFragment(returnFiber, oldFiber, newChild, lanes, null);
            }
        }
        return null;
    }

    /**
     * 
     * @param {Fiber} returnFiber 
     * @param {Fiber|null} currentFirstChild 
     * @param {Array} newChildren 
     * @param {Lanes} lanes 
     * @returns Fiber | null
     */
    function reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChildren,
        lanes
    ) {
        // 最终要返回的第一个儿子，为了之后的遍历
        let resultingFirstChild = null;
        let previousNewFiber = null;
        let oldFiber = currentFirstChild;
        let lastPlacedIndex = 0;
        let newIdx = 0;
        let nextOldFiber = null;
        for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
            if (oldFiber.index > newIdx) {
                nextOldFiber = oldFiber;
                oldFiber = null;
            } else {
                nextOldFiber = oldFiber.sibling;
            }

            // 创建fiber
            const newFiber = updateSlot(
                returnFiber,
                oldFiber,
                newChildren[newIdx],
                lanes,
            );
            if (newFiber === null) {
                // TODO: This breaks on empty slots like null children. That's
                // unfortunate because it triggers the slow path all the time. We need
                // a better way to communicate whether this was a miss or null,
                // boolean, undefined, etc.
                if (oldFiber === null) {
                    oldFiber = nextOldFiber;
                }
                break;
            }
            if (shouldTrackSideEffects) {
                if (oldFiber && newFiber.alternate === null) {
                    // We matched the slot, but we didn't reuse the existing fiber, so we
                    // need to delete the existing child.
                    deleteChild(returnFiber, oldFiber);
                }
            }
            lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
            if (previousNewFiber === null) {
                // TODO: Move out of the loop. This only happens for the first run.
                resultingFirstChild = newFiber;
            } else {
                // 把newFiber赋值给之前的fiber
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
        }

        if (newIdx === newChildren.length) {
            // We've reached the end of the new children. We can delete the rest.
            deleteRemainingChildren(returnFiber, oldFiber);
            return resultingFirstChild;
        }

        if (oldFiber === null) {
            // If we don't have any more existing children we can choose a fast path
            // since the rest will all be insertions.
            for (; newIdx < newChildren.length; newIdx++) {
                const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
                if (newFiber === null) {
                    continue;
                }
                lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
                if (previousNewFiber === null) {
                    resultingFirstChild = newFiber;
                } else {
                    previousNewFiber.sibling = newFiber;
                }
                previousNewFiber = newFiber;
            }
            return resultingFirstChild;
        }

        // Add all children to a key map for quick lookups.
        const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

        // Keep scanning and use the map to restore deleted items as moves.
        for (; newIdx < newChildren.length; newIdx++) {
            const newFiber = updateFromMap(
                existingChildren,
                returnFiber,
                newIdx,
                newChildren[newIdx],
                lanes,
            );
            if (newFiber !== null) {
                if (shouldTrackSideEffects) {
                    if (newFiber.alternate !== null) {
                        // The new fiber is a work in progress, but if there exists a
                        // current, that means that we reused the fiber. We need to delete
                        // it from the child list so that we don't add it to the deletion
                        // list.
                        existingChildren.delete(
                            newFiber.key === null ? newIdx : newFiber.key,
                        );
                    }
                }
                lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
                if (previousNewFiber === null) {
                    resultingFirstChild = newFiber;
                } else {
                    previousNewFiber.sibling = newFiber;
                }
                previousNewFiber = newFiber;
            }
        }

        if (shouldTrackSideEffects) {
            // Any existing children that weren't consumed above were deleted. We need
            // to add them to the deletion list.
            existingChildren.forEach(child => deleteChild(returnFiber, child));
        }

        return resultingFirstChild;
    }

    /**
     * 
     * @param {Fiber} fiber 
     * @param {mixed} pendingProps 
     * @returns Fiber
     */
    function useFiber(fiber, pendingProps) {
        // We currently set sibling to null and index to 0 here because it is easy
        // to forget to do before returning it. E.g. for the single child case.
        const clone = createWorkInProgress(fiber, pendingProps);
        clone.index = 0;
        clone.sibling = null;
        return clone;
    }

    /**
     * 
     * @param {Fiber} returnFiber 
     * @param {Fiber | null} currentFirstChild 
     * @param {ReactElement} element 
     * @param {Lanes} lanes 
     * @returns Fiber
     */
    function reconcileSingleElement(
        returnFiber,
        currentFirstChild,
        element,
        lanes,
    ) {
        const key = element.key;
        let child = currentFirstChild;
        while (child !== null) {
            if (child.key === key) {
                switch (child.tag) {
                    case Fragment: {
                        if (element.type === REACT_FRAGMENT_TYPE) {
                            deleteRemainingChildren(returnFiber, child.sibling);
                            const existing = useFiber(child, element.props.children);
                            existing.return = returnFiber;
                            return existing;
                        }
                        break;
                    }
                    // We intentionally fallthrough here if enableBlocksAPI is not on.
                    // eslint-disable-next-lined no-fallthrough
                    default: {
                        if (
                            child.elementType === element.type
                        ) {
                            deleteRemainingChildren(returnFiber, child.sibling);
                            const existing = useFiber(child, element.props);
                            existing.ref = coerceRef(returnFiber, child, element);
                            existing.return = returnFiber;
                            return existing;
                        }
                        break;
                    }
                }
                // Didn't match.
                deleteRemainingChildren(returnFiber, child);
                break;
            } else {
                deleteChild(returnFiber, child);
            }
            child = child.sibling;
        }

        // 创建fiber
        if (element.type === REACT_FRAGMENT_TYPE) {
            const created = createFiberFromFragment(
                element.props.children,
                returnFiber.mode,
                lanes,
                element.key,
            );
            created.return = returnFiber;
            return created;
        } else {
            const created = createFiberFromElement(element, returnFiber.mode, lanes);
            created.ref = coerceRef(returnFiber, currentFirstChild, element);
            created.return = returnFiber;
            return created;
        }
    }

    /**
     * 
     * @param {Fiber} newFiber 
     * @returns Fiber
     */
    function placeSingleChild(newFiber) {
        // This is simpler for the single child case. We only need to do a
        // placement for inserting new children.
        if (shouldTrackSideEffects && newFiber.alternate === null) {
            newFiber.flags = Placement;
        }
        return newFiber;
    }


    // This API will tag the children with the side-effect of the reconciliation
    // itself. They will be added to the side-effect list as we pass through the
    // children and the parent.
    /**
     * 
     * @param {Fiber} returnFiber 
     * @param {Fiber | null} currentFirstChild 
     * @param {any} newChild 
     * @param {Lanes} lanes 
     * @returns Fiber | null 
     */
    function reconcileChildFibers(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes
    ) {
        // This function is not recursive.
        // If the top level item is an array, we treat it as a set of children,
        // not as a fragment. Nested arrays on the other hand will be treated as
        // fragment nodes. Recursion happens at the normal flow.

        // Handle top level unkeyed fragments as if they were arrays.
        // This leads to an ambiguity between <>{[...]}</> and <>...</>.
        // We treat the ambiguous cases above the same.
        const isUnkeyedTopLevelFragment =
            typeof newChild === 'object' &&
            newChild !== null &&
            newChild.type === REACT_FRAGMENT_TYPE &&
            newChild.key === null;
        if (isUnkeyedTopLevelFragment) {
            newChild = newChild.props.children;
        }

        // Handle object types
        const isObject = typeof newChild === 'object' && newChild !== null;

        if (isObject) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE:
                    return placeSingleChild(
                        reconcileSingleElement(
                            returnFiber,
                            currentFirstChild,
                            newChild,
                            lanes,
                        ),
                    );
                case REACT_PORTAL_TYPE:
                    return placeSingleChild(
                        reconcileSinglePortal(
                            returnFiber,
                            currentFirstChild,
                            newChild,
                            lanes,
                        ),
                    );
                case REACT_LAZY_TYPE:
                    if (enableLazyElements) {
                        const payload = newChild._payload;
                        const init = newChild._init;
                        // TODO: This function is supposed to be non-recursive.
                        return reconcileChildFibers(
                            returnFiber,
                            currentFirstChild,
                            init(payload),
                            lanes,
                        );
                    }
            }
        }

        if (typeof newChild === 'string' || typeof newChild === 'number') {
            return placeSingleChild(
                reconcileSingleTextNode(
                    returnFiber,
                    currentFirstChild,
                    '' + newChild,
                    lanes,
                ),
            );
        }

        if (isArray(newChild)) {
            return reconcileChildrenArray(
                returnFiber,
                currentFirstChild,
                newChild,
                lanes,
            );
        }

        if (getIteratorFn(newChild)) {
            return reconcileChildrenIterator(
                returnFiber,
                currentFirstChild,
                newChild,
                lanes,
            );
        }

        if (isObject) {
            return throw new Error('isObject');
        }
        // Remaining cases are all treated as empty.
        return deleteRemainingChildren(returnFiber, currentFirstChild);
    }
    return reconcileChildFibers;
}
/**
 * 
 * @param {Fiber | null} current
 * @param {Fiber} workInProgress 
 */
export function cloneChildFibers(current, workInProgress) {

}
export const reconcileChildFibers = ChildReconciler(true);
export const mountChildFibers = ChildReconciler(false);