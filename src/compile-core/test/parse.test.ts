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
        children: [],
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
  test("union type", () => {
    const ast = baseParese("<div>hi,{{message}}</div>");
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hi,",
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });
  test("union type tag", () => {
    const ast = baseParese("<div><p>hi</p>{{message}}</div>");
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: "p",
          children: [
            {
              type: NodeTypes.TEXT,
              content: "hi",
            },
          ],
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });
  test("should throw error when lack end tag", () => {
    expect(() => {
      baseParese("<div><span></div>");
    }).toThrowError(`lack end tag:span`);
  });
});
