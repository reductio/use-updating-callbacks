import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export default {
  input: "index.ts",
  plugins: [typescript()],
  output: {
    file: "dist/index.js",
    format: "cjs",
    plugins: [terser()],
  },
  external: ["react"],
};
