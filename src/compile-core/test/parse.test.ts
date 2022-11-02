import { NodeTypes } from "./../src/ast";
import { baseParese } from "../src/parse";

describe("parse", () => {
  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParese("{{message}}");
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });
  });
});
