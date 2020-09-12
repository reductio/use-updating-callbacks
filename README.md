# Organize callbacks and avoid rerenders

Examples below can be found in this [Sandbox](https://codesandbox.io/s/useupdatingcallbacks-example-hbk5v).

The hooks **useUpdatingCallbacks** and **useUpdatingCallback** can be used to define callback functions that always use the latest closure of the latest rerender, but never change their identity. Let's see this example without the hooks:

```js
import React, { useState, useCallback } from "react";

// Button that shows a console.log message when it's rerendered
const ScreamingButton = React.memo(({ onClick, children }) => {
  console.log("RERENDERING!!!");
  return <button onClick={onClick}>{children}</button>;
});

function App() {
  const [count, setCount] = useState(0);
  const [doubleIt, setDoubleIt] = useState(false);

  // callback that needs to be updated when doubleIt changes
  const onButton1Click = useCallback(
    () => setCount((oldValue) => oldValue + (doubleIt ? 2 : 1)),
    [doubleIt]
  );

  // callback that needs to be updated when doubleIt or count change
  const onButton2Click = useCallback(
    () =>
      alert(
        `Currently we have counted ${count} clicks.${
          doubleIt ? "The next click will be doubled!" : ""
        }`
      ),
    [doubleIt, count]
  );

  return (
    <div className="App">
      <ScreamingButton onClick={onButton1Click}>Increase</ScreamingButton>
      <ScreamingButton onClick={onButton2Click}>Info</ScreamingButton>
      <div>
        Double it:{" "}
        <input type="checkbox" onChange={(e) => setDoubleIt(e.target.checked)}></input>
      </div>
      <p>Counted {count} clicks.</p>
    </div>
  );
}
```

The callbacks defined here need to be updated when the internal states _count_ and _doubleIt_ change. This leads to rerenders of the two _ScreamingButton_ components, because their onClick property changes. However, their appearance doesn't change, only the callback, so there shouldn't be a rerender - we used React.memo for a reason here. (Please note that of course in this example a rerender wouldn't harm the performance. This is a simplified example. For more complex components, it can matter, though.)

With the **useUpdatingCallbacks** hook, you can achieve that no rerenders happen:

```js
import React, { useState } from "react";
import { useUpdatingCallbacks } from "use-updating-callbacks";

// Button that shows a console.log message when it's rerendered
const ScreamingButton = React.memo(({ onClick, children }) => {
  console.log("RERENDERING!!!");
  return <button onClick={onClick}>{children}</button>;
});

function App() {
  const [count, setCount] = useState(0);
  const [doubleIt, setDoubleIt] = useState(false);

  const callbacks = useUpdatingCallbacks({
    onButton1Click: () => setCount((oldValue) => oldValue + (doubleIt ? 2 : 1)),
    onButton2Click: () =>
      alert(
        `Currently we have counted ${count} clicks.${
          doubleIt ? "The next click will be doubled!" : ""
        }`
      ),
  });

  return (
    <div className="App">
      <ScreamingButton onClick={callbacks.onButton1Click}>
        Increase
      </ScreamingButton>
      <ScreamingButton onClick={callbacks.onButton2Click}>Info</ScreamingButton>
      <div>
        Double it:{" "}
        <input type="checkbox" onChange={(e) => setDoubleIt(e.target.checked)}></input>
      </div>
      <p>Counted {count} clicks.</p>
    </div>
  );
}
```

The callbacks object created here will contain wrapper functions that stay the same for every rerender of the component. This means, that both _ScreamingButtons_ never have to rerender, because the callback functions are the same all the time. Due to a litte javascript closure magic, still always the most recent version of the callbacks are called. Because of this, you also don't need to specify a dependency array like you need for _useCallback_. All callbacks are updated on every rerender, because it doesn't affect the performance and makes the component easier to understand.

The object given to **useUpdatingCallbacks** can use a hierarchy, to allow a nice structure in complex components:

```js
const callbacks = useUpdatingCallbacks({
    navigation: {
      onMain: ...,
      onHelp: {
        onSupport: ...,
        onFAQ: ...
      }
    },
    product: {
      onSwitchImage: ...,
      onExpandDetails: ...,
    }
  });

  return (<div>
    {/* stuff */}
    <button onClick={callbacks.product.onExpandDetails}>Show details</button>
    {/* more stuff */}
  </div>);
```

If you need only one callback you can also use **useUpdatingCallback** instead:

```js
const onButtonClick = useUpdatingCallback((event) => ...);
```

## Callbacks that can be undefined

If your components receives callbacks that can be undefined (and event might change between defined and undefined) and you want to include them in your callbacks object, wrap them in **_wrapUndefinedFunction_**. In the returned callbacks object, the function will then always be defined and will return **undefined** if the original function is not defined.

```js
import React from "react";
import {
  useUpdatingCallbacks,
  wrapUndefinedFunction,
} from "use-updating-callbacks";

function App({ onlySometimes }: { onlySometimes?: () => number }) {
  const callbacks = useUpdatingCallbacks({
    onlySometimes: wrapUndefinedFunction(onlySometimes),
  });

  callbacks.onlySometimes(); // always works. Returns undefined if onlySometimes is undefined, otherwise onlySometimes is called normally and the return value is returned here.
}
```

### Reference other callbacks

Of course you can call one callback in another callback:

```js
const callbacks = useUpdatingCallbacks({
  one: () => console.log("hello world!"),
  two: () => {
    callbacks.one();
    console.log("42!");
  },
});
```

## Caveats

The given object to **useUpdatingCallbacks** should have the same structure on every rerender. While it's of course possible that functions are changed (that's the point of the whole thing ...), every entry in the object that was a function should stay a function, and every entry which was an object, should stay an object.

## Typescript

Type definitions are included. Both hooks, **useUpdatingCallbacks** and **useUpdatingCallback**, always return the same type they received as input parameter:

```js
declare type Callbacks = {
    [key: string]: ((...args: any[]) => any) | Callbacks;
};

declare function useUpdatingCallbacks<T extends Callbacks>(callbacks: T): T;
declare function useUpdatingCallback<T extends (...args: any[]) => any>(callback: T): T;
```
