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
  describe("element", () => {
    test("simple element", () => {
      const ast = baseParese("<div></div>");
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
      });
    });
  });
  describe("text", () => {
    test("simple text", () => {
      const ast = baseParese("hello world");
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "hello world",
      });
    });
  });
});
