import {
    BlockingRoot,
    ConcurrentRoot,
    LegacyRoot,
} from '../../../react-reconciler/src/ReactRootTags';
import {
    createContainer
  } from '../../../react-reconciler/src/ReactFiberReconciler';
function createRootImpl(
    container,
    tag,
    options
) {
    // Tag is either LegacyRoot or Concurrent Root
    const hydrate = options != null && options.hydrate === true;
    const hydrationCallbacks =
        (options != null && options.hydrationOptions) || null;
    const mutableSources =
        (options != null &&
            options.hydrationOptions != null &&
            options.hydrationOptions.mutableSources) ||
        null;
    const root = createContainer(container, tag, hydrate, hydrationCallbacks);
    markContainerAsRoot(root.current, container);
    const containerNodeType = container.nodeType;

    if (enableEagerRootListeners) {
        const rootContainerElement =
            container.nodeType === COMMENT_NODE ? container.parentNode : container;
        listenToAllSupportedEvents(rootContainerElement);
    } else {
        if (hydrate && tag !== LegacyRoot) {
            const doc =
                containerNodeType === DOCUMENT_NODE
                    ? container
                    : container.ownerDocument;
            // We need to cast this because Flow doesn't work
            // with the hoisted containerNodeType. If we inline
            // it, then Flow doesn't complain. We intentionally
            // hoist it to reduce code-size.
            eagerlyTrapReplayableEvents(container, doc);
        } else if (
            containerNodeType !== DOCUMENT_FRAGMENT_NODE &&
            containerNodeType !== DOCUMENT_NODE
        ) {
            ensureListeningTo(container, 'onMouseEnter', null);
        }
    }

    if (mutableSources) {
        for (let i = 0; i < mutableSources.length; i++) {
            const mutableSource = mutableSources[i];
            registerMutableSourceForHydration(root, mutableSource);
        }
    }

    return root;
}
function ReactDOMBlockingRoot(
    container,
    tag,
    options
) {
    this._internalRoot = createRootImpl(container, tag, options);//返回FiberRoot
}
export function createLegacyRoot(
    container,
    options
) {
    return new ReactDOMBlockingRoot(container, LegacyRoot, options);
}