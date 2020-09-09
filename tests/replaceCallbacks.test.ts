import { isExportDeclaration } from "typescript";
import replaceCallbacks from "../src/replaceCallbacks";

type Functions = {
  a: (...args: any[]) => any;
  b: (...args: any[]) => any;
  c: {
    d: (...args: any[]) => any;
    e: {
      f: (...args: any[]) => any;
    };
  };
};

describe("Function Replacement", () => {
  // prepare
  const function1 = (arg1: number, arg2: number, arg3: string) =>
    `${arg3} => ${arg1 + arg2}`;
  const function2 = (arg1: string, arg2: string) => arg1 + arg2;
  const function3 = (arg1: number, arg2: number) => arg1 - arg2;
  const function4 = (arg1: number, arg2: number) => arg1 * arg2;

  let obj: Functions;
  let replaced: Functions;

  beforeEach(() => {
    obj = {
      a: function1,
      b: function2,
      c: {
        d: function3,
        e: {
          f: function4,
        },
      },
    };

    replaced = replaceCallbacks(() => obj);
  });

  test("Types", () => {
    // assert
    expect(replaced).not.toBe(obj);

    expect("a" in replaced).toBeTruthy();
    expect("b" in replaced).toBeTruthy();
    expect("c" in replaced).toBeTruthy();
    expect(typeof replaced.a === "function").toBeTruthy();
    expect(replaced.a).not.toEqual(obj.a);
    expect(replaced.b).not.toEqual(obj.b);
    expect(typeof replaced.b === "function").toBeTruthy();
    expect(typeof replaced.c === "object").toBeTruthy();

    expect("d" in replaced.c).toBeTruthy();
    expect("e" in replaced.c).toBeTruthy();
    expect(typeof replaced.c.d === "function").toBeTruthy();
    expect(replaced.c.d).not.toEqual(obj.c.d);
    expect(typeof replaced.c.e === "object").toBeTruthy();

    expect("f" in replaced.c.e).toBeTruthy();
    expect(typeof replaced.c.e.f === "function").toBeTruthy();
    expect(replaced.c.e.f).not.toEqual(obj.c.e.f);
  });

  test("Functions", () => {
    // assert
    expect(replaced.a(3, 4, "hello")).toEqual(obj.a(3, 4, "hello"));
    expect(replaced.b("a", "b")).toEqual(obj.b("a", "b"));
    expect(replaced.c.d(5, 4)).toEqual(obj.c.d(5, 4));
    expect(replaced.c.e.f(42, 23)).toEqual(obj.c.e.f(42, 23));
  });

  test("Replacement", () => {
    // act
    obj = {
      a: function4,
      b: function3,
      c: {
        d: function2,
        e: {
          f: function1,
        },
      },
    };

    // assert
    expect(replaced.a(23, 42)).toEqual(function4(23, 42));
    expect(replaced.b(42, 23)).toEqual(function3(42, 23));
    expect(replaced.c.d("hello", "world")).toEqual(function2("hello", "world"));
    expect(replaced.c.e.f(42, 23, "hello")).toEqual(function1(42, 23, "hello"));
  });
});
