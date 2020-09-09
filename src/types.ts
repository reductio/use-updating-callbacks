export type Callbacks = {
  [key: string]: ((...args: any[]) => any) | Callbacks;
};
