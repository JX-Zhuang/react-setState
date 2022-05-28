import * as React from 'react';
import * as ReactDOM from 'react-dom';
class App extends React.Component {
    parentRef = React.createRef();
    childRef = React.createRef();
    componentDidMount() {
        this.parentRef.current.addEventListener("click", () => {
            console.log("父元素原生捕获");
        }, true);
        this.parentRef.current.addEventListener("click", () => {
            console.log("父元素原生冒泡");
        });
        this.childRef.current.addEventListener("click", () => {
            console.log("子元素原生捕获");
        }, true);
        this.childRef.current.addEventListener("click", () => {
            console.log("子元素原生冒泡");
        });
        document.getElementById('root').addEventListener('click', () => {
            console.log("root原生捕获");
        }, true);
        document.getElementById('root').addEventListener('click', () => {
            console.log("root原生冒泡");
        });
    }
    parentBubble = () => {
        console.log("父元素React事件冒泡");
    };
    childBubble = () => {
        console.log("子元素React事件冒泡");
    };
    parentCapture = () => {
        console.log("父元素React事件捕获");
    };
    childCapture = () => {
        console.log("子元素React事件捕获");
    };
    render() {
        return (
            <div ref={this.parentRef} onClick={this.parentBubble} onClickCapture={this.parentCapture}>
                <p ref={this.childRef} onClick={this.childBubble} onClickCapture={this.childCapture}>
                    事件执行顺序
                </p>
            </div>
        );
    }
}
ReactDOM.render(<App />, document.getElementById('root'));