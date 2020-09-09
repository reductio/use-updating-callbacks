import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import bundleSize from "rollup-plugin-bundle-size";

export default {
  input: "index.ts",
  plugins: [typescript()],
  output: {
    file: "dist/index.js",
    format: "cjs",
    plugins: [
      terser({
        output: {
          comments: false,
        },
        compress: {
          booleans_as_integers: true,
          drop_console: true,
          unsafe: true,
        },
      }),
      bundleSize(),
    ],
  },
  external: ["react"],
};
