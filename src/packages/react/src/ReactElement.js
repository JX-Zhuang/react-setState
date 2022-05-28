import { REACT_ELEMENT_TYPE } from '../../shared/ReactSymbols';
// 保留属性
const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true,
};
const ReactElement = function (type, key, ref, self, source, owner, props) {
    const element = {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        key: key,
        ref: ref,
        props: props,
        _owner: owner,
    };

    return element;
};

export function createElement(type, config, children) {
    let key = null, propName, ref = null;
    const props = {};
    if (config !== null) {
        key = config.key;
        ref = config.ref;
        for (propName in config) {
            if (!RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
            }
        }
    }
    const childrenLength = arguments.length - 2;
    if (childrenLength === 1) {
        props.children = children;
    } else if (childrenLength > 1) {
        const childArray = Array(childrenLength);
        for (let i = 0; i < childrenLength; i++) {
            childArray[i] = arguments[i + 2];
        }
        props.children = childArray;
    }
    return ReactElement(type,
        key,
        ref,
        undefined,
        undefined,
        null,
        props
    );
}