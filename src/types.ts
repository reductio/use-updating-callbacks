export type AnyFunction = (...args: any[]) => any;

export type Callbacks = {
  [key: string]: Function | Callbacks;
};
