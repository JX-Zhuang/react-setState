import * as React from 'react';
// import * as ReactDOM from 'react-dom';
import { Component } from './ReactBaseClasses';
class Counter extends Component {
    state = { number: 0 }
    onClick = () => {
        console.log('buttonClick');
        debugger
        this.setState({ number: this.state.number + 1 });
        console.log(this.state.number);
        debugger
        this.setState({ number: this.state.number + 1 });
        console.log(this.state.number);
        // setTimeout(() => {
        //     this.setState({ number: this.state.number + 1 });
        //     console.log('setTimeout', this.state.number);
        //     this.setState({ number: this.state.number + 1 });
        //     console.log('setTimeout', this.state.number);
        // },1000);
    }
    render() {
        console.log('render', this.state.number);
        return (
            <div onClick={this.divClick} id="counter">
                <p>{this.state.number}</p>
                <button onClick={this.onClick}>+</button>
            </div>
        )
    }
}
export default Counter;