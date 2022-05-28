import {
    DOCUMENT_NODE,
    ELEMENT_NODE,
    COMMENT_NODE,
} from '../shared/HTMLNodeType';
import { ROOT_ATTRIBUTE_NAME } from '../shared/DOMProperty';
import { createLegacyRoot } from './ReactDOMRoot';
import {
    // findHostInstanceWithNoPortals,
    updateContainer,
    unbatchedUpdates,
    // getPublicRootInstance,
    // findHostInstance,
    // findHostInstanceWithWarning,
} from '../../../react-reconciler/src/ReactFiberReconciler'
function getReactRootElementInContainer(container: any) {
    if (!container) {
        return null;
    }

    if (container.nodeType === DOCUMENT_NODE) {
        return container.documentElement;
    } else {
        return container.firstChild;
    }
}

function shouldHydrateDueToLegacyHeuristic(container) {
    const rootElement = getReactRootElementInContainer(container);
    return !!(
        rootElement &&
        rootElement.nodeType === ELEMENT_NODE &&
        rootElement.hasAttribute(ROOT_ATTRIBUTE_NAME)
    );
}
function legacyCreateRootFromDOMContainer(
    container,
    forceHydrate,
) {
    // shouldHydrate 不影响逻辑
    const shouldHydrate =
        forceHydrate || shouldHydrateDueToLegacyHeuristic(container);
    // First clear any existing content.
    if (!shouldHydrate) {
        let warned = false;
        let rootSibling;
        while ((rootSibling = container.lastChild)) {
            container.removeChild(rootSibling);
        }
    }
    return createLegacyRoot(
        container,
        shouldHydrate
            ? {
                hydrate: true,
            }
            : undefined,
    );
}

/**
 * 
 * @param {*} parentComponent 
 * @param {*} children :需要渲染的组件
 * @param {*} container :渲染后，组件所在的容器
 * @param {*} forceHydrate 
 * @param {*} callback 
 */
function legacyRenderSubtreeIntoContainer(
    parentComponent,
    children,
    container,
    forceHydrate,
    callback,
) {
    // 暂时不看 callback 和 getPublicRootInstance 的逻辑 
    let root = container._reactRootContainer;
    let fiberRoot;
    if (!root) {
        // Initial mount
        root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
            container,
            forceHydrate,
        );
        // _internalRoot 是 FiberRoot 的实例
        fiberRoot = root._internalRoot;

        // if (typeof callback === 'function') {
        //     const originalCallback = callback;
        //     callback = function () {
        //         const instance = getPublicRootInstance(fiberRoot);
        //         originalCallback.call(instance);
        //     };
        // }

        // Initial mount should not be batched.
        unbatchedUpdates(() => {
            // debugger
            updateContainer(children, fiberRoot, parentComponent, callback);
        });
    } else {
        fiberRoot = root._internalRoot;

        // if (typeof callback === 'function') {
        //     const originalCallback = callback;
        //     callback = function () {
        //         const instance = getPublicRootInstance(fiberRoot);
        //         originalCallback.call(instance);
        //     };
        // }

        // Update
        updateContainer(children, fiberRoot, parentComponent, callback);
    }
    // return getPublicRootInstance(fiberRoot);
}
/**
 * 
 * ReactDOM.render(<App /> ,document.getElementById('root'));
 * @param {*} element 需要渲染的组件
 * @param {*} container 渲染后，组件所在的容器
 * @param {*} callback 
 * @returns 
 */
export function render(
    element,
    container,
    callback,
) {
    return legacyRenderSubtreeIntoContainer(
        null,
        element,
        container,
        false,
        callback,
    );
}