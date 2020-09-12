import { AnyFunction } from "./types";

export function wrapUndefinedFunction<T extends AnyFunction>(
  func: T | undefined
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  return (...args: Parameters<T>) => {
    if (func) {
      return func(...args);
    }
    return undefined;
  };
}
