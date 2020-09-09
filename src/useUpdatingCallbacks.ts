import { useRef, useEffect, MutableRefObject } from "react";
import { Callbacks } from "./types";
import replaceCallbacks from "./replaceCallbacks";

function useUpdatedRef<T>(
  value: T,
  create: (ref: MutableRefObject<T>) => T
): T {
  const refObject = useRef<T>(value);

  useEffect(() => {
    refObject.current = value;
  });

  const updating = useRef<T | undefined>(undefined);
  if (!updating.current) {
    updating.current = create(refObject);
  }

  return updating.current;
}

export function useUpdatingCallbacks<T extends Callbacks>(callbacks: T): T {
  return useUpdatedRef(callbacks, (ref) => replaceCallbacks(() => ref.current));
}

export function useUpdatingCallback<T extends (...args: any[]) => any>(
  callback: T
): T {
  return useUpdatedRef(
    callback,
    (ref) => ((...args: any[]) => ref.current(...args)) as T
  );
}
