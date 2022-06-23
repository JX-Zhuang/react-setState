import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Counter from './Counter';
import { batchedUpdates } from './ReactFiberWorkLoop';
import { NoMode, ConcurrentMode } from './ReactTypeOfMode';
import { ClassComponent, HostRoot } from './ReactWorkTag';
let counterInstance = new Counter();
let mode = NoMode;//ConcurrentMode;
let rootFiber = {
    tag: HostRoot,
    updateQueue: [],    //更新队列，源码里是链表
    mode
};
let counterFiber = {
    tag: ClassComponent,
    updateQueue: [],
    mode
};

counterFiber.stateNode = counterInstance;

counterInstance._reactInternals = counterFiber;

rootFiber.child = counterFiber;
counterFiber.return = rootFiber;


//合成事件
document.addEventListener('click', (nativeEvent) => {
    let syntheticEvent = { nativeEvent };
    //源码里先通过事件，找到事件源，再通过事件源找到对应的处理函数
    batchedUpdates(()=>counterInstance.onClick(syntheticEvent));
    // counterInstance.onClick(syntheticEvent);
});
// ReactDOM.render(<Counter />, document.getElementById('root'));
// ReactDOM.createRoot(document.getElementById('root')).render(<Counter/>);
const App = ()=>{
    return <div>app</div>
}
console.log(App)
console.log(<App/>)