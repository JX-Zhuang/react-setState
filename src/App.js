import React, { useEffect, useState } from 'react'
// import React from './packages/react';
const Item = () => {
  useEffect(() => {
    console.log('did mount');
  }, []);
  return <div>item</div>
}
const App = () => {
  const [a, setA] = useState(false);
  return <div onClick={() => setA(true)}>
    {a ? <p key="1">ppp</p> : <div>div</div>}
    <Item key="item" />
  </div>
}
export default App;
