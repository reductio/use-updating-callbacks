import { Callbacks } from "./types";

function throwError(): never {
  throw new Error("Callbacks object changed unexpectedly");
}

export default function replaceCallbacks<T extends Callbacks>(
  resolveCallbacksObject: () => T
): T {
  const callbacks = resolveCallbacksObject();
  const replaced: Callbacks = { ...callbacks };

  Object.entries(replaced).forEach(([key, value]) => {
    if (value instanceof Function) {
      replaced[key] = (...args: any[]) => {
        const resolvedValue: Callbacks = resolveCallbacksObject();
        const me = resolvedValue[key];
        if (me instanceof Function) {
          return me(...args);
        } else {
          throwError();
        }
      };
    } else if (typeof value === "object") {
      replaced[key] = replaceCallbacks(() => {
        const resolvedValue: Callbacks = resolveCallbacksObject();
        const me = resolvedValue[key];
        if (me instanceof Function) {
          throwError();
        }
        return me;
      });
    }
  });

  return replaced as T;
}
