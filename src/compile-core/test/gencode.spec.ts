import { transform } from "./../src/transform";
import { generate } from "../src/gencode";
import { baseParese } from "./../src/parse";
describe("gencode", () => {
  it.only("string", () => {
    const ast = baseParese("hi");
    transform(ast);
    const { code } = generate(ast);
    const expectResult = `
    return function render(_ctx, _cache, $props, $setup, $data, $options) {
      return "hi"
    }
    `;
    expect(code).toMatchSnapshot(expectResult);
  });
});
