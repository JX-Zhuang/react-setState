let style = { border: '1px solid red', color: 'red', margin: '5px' };
let A = {
    type: 'div',
    key: 'A',
    props: {
        style,
        children: [
            { type: 'div', key: 'B1', props: { style, children: [] } },
            { type: 'div', key: 'B2', props: { style, children: [] } }
        ]
    }
}
// let C = {
//     type: 'div',
//     key: 'C',
//     props: {
//         style,
//         children: [
//             { type: 'div', key: 'C1', props: { style, children: [] } },
//             { type: 'div', key: 'C2', props: { style, children: [] } }
//         ]
//     }
// }
//表示一个工作单元，正在处理中的fiber
let workInProgress;
const Placement = 'Placement';
const TAG_ROOT = 'TAG_ROOT';//Fiber根节点
const TAG_HOST = 'TAG_HOST';//原生dom节点 div p span
let root = document.getElementById('root');
let rootFiber = {
    tag: TAG_ROOT,  //Fiber的类型
    key: 'ROOT',    //唯一标签
    stateNode: root, //Fiber对应的真实DOM节点
    props: {
        children: [A]
    }
};
function workLoop() {
    while (workInProgress) {
        workInProgress = performUnitOfWork(workInProgress);
    }
    console.log(rootFiber);
    commitRoot(rootFiber);
}
function commitRoot(rootFiber) {
    let currentEffect = rootFiber.firstEffect;
    while (currentEffect) {
        let flags = currentEffect.flags;
        switch (flags) {
            case Placement:
                commitPlacement(currentEffect);
        }
        currentEffect = currentEffect.nextEffect;
    }
}
function commitPlacement(currentEffect) {
    let parent = currentEffect.return.stateNode;//父DOM节点
    parent.appendChild(currentEffect.stateNode);
}
function performUnitOfWork(workInProgress) {
    beginWork(workInProgress);  //构建子fiber树
    if (workInProgress.child) {
        return workInProgress.child;
    }
    //如果没有儿子，构建弟弟
    while (workInProgress) {
        //如果没有儿子，自己结束
        completeUnitOfWork(workInProgress);
        if (workInProgress.sibling) {
            return workInProgress.sibling;
        }
        //没有弟弟，找叔叔。爸爸的弟弟
        workInProgress = workInProgress.return;
        //如果没有父亲，结束
    }
}
// Fiber在结束的时候创建真实的DOM元素
function completeUnitOfWork(workInProgress) {
    console.log('completeUnitOfWork', workInProgress.key);
    let stateNode; //真实DOM
    switch (workInProgress.tag) {
        case TAG_HOST:
            stateNode = createStateNode(workInProgress);
            break;
    }
    //在完成工作的单元的时候要判断当前的fiber节点有没有对应的DOM操作
    makeEffectList(workInProgress);
}

//副作用链表
function makeEffectList(completeWork) {
    let returnFiber = completeWork.return;
    if (returnFiber) {
        if (!returnFiber.firstEffect) {
            returnFiber.firstEffect = completeWork.firstEffect;
        }
        if (completeWork.lastEffect) {
            if (returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect = completeWork.firstEffect;
            }
            returnFiber.lastEffect = completeWork.lastEffect;
        }
        if (completeWork.flags) {
            if (returnFiber.lastEffect) {
                returnFiber.lastEffect.nextEffect = completeWork;
            } else {
                returnFiber.firstEffect = completeWork;
            }
            returnFiber.lastEffect = completeWork;
        }
    }
}

function createStateNode(fiber) {
    if (fiber.tag === TAG_HOST) {
        let stateNode = document.createElement(fiber.type);
        fiber.stateNode = stateNode;
    }
    return fiber.stateNode;
}
/**
 * 根据当前的Fiber和虚拟DOM构建Fiber树
 * @param {*} workInProgress 
 * @returns 
 */
function beginWork(workInProgress) {
    console.log('beginWork', workInProgress.key);
    let nextChildren = workInProgress.props.children;
    //根据父Fiber和所有儿子的虚拟DOM儿子们构建出子Fiber树
    return reconcileChildren(workInProgress, nextChildren);
}

/**
 * 根据父Fiber和子虚拟DOM数组，构建当前returnFiber的子Fiber树
 * @param {Fiber} returnFiber 
 * @param {*} nextChildren 虚拟dom
 * @returns 
 */
function reconcileChildren(returnFiber, nextChildren) {
    let previousNewFiber;   //上一个Fiber儿子
    let firstChildFiber;    //当前returnFiber的大儿子
    for (let newIndex = 0; newIndex < nextChildren.length; newIndex++) {
        let newFiber = createFiber(nextChildren[newIndex]);
        newFiber.flags = Placement; //新节点，要插入DOM中
        newFiber.return = returnFiber;
        if (!firstChildFiber) {
            firstChildFiber = newFiber;
        } else {
            previousNewFiber.sibling = newFiber;
        }
        previousNewFiber = newFiber;
    }
    returnFiber.child = firstChildFiber;
    return firstChildFiber;
}
function createFiber(element) {
    return {
        tag: TAG_HOST,
        type: element.type,  //具体div p span
        key: element.key,   //唯一标识
        props: element.props    //属性对象
    }
}
//当前正在执行的工作单元
workInProgress = rootFiber;
workLoop();
Placement
