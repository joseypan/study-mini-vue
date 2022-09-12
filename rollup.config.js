/**
 * @FileDescription:用来配置rollup打包设置
 * @Author: 潘旭敏
 * @Date: 2022-09-12
 * @LastEditors: 潘旭敏
 * @LastEditTime:2022-09-12 16:17
 */
import typescript from "@rollup/plugin-typescript";
export default {
  input: "./src/index.ts",
  output: [
    {
      format: "cjs",
      file: "lib/guide-mini-vue.cjs.js",
    },
    {
      format: "es",
      file: "lib/guid-mini-vue.esm.js",
    },
  ],
  plugins: [typescript()],
};
