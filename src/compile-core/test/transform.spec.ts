import { baseParese } from "./../src/parse";
import { transform } from "../src/transform";
import { NodeTypes } from "../src/ast";
describe("transform", () => {
  it("transform use", () => {
    const ast = baseParese("<div>hi,{{message}}</div>");
    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content += "josey";
      }
    };
    transform(ast, { nodeTransforms: [plugin] });
    const textNode = ast.children[0].children[0];
    expect(textNode.content).toBe("hi,josey");
  });
});
