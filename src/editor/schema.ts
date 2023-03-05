import { Schema, type Attrs } from "prosemirror-model";
import { parse, inject } from "regexparam";
import { routes } from "../lib/routes";

const hex = (x: string) => ("0" + parseInt(x).toString(16)).slice(-2);
// https://stackoverflow.com/a/3627747
// TODO: cambiar por una solución más copada
function rgbToHex(rgb: string): string {
  const matches = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!matches) throw new Error("no pude parsear el rgb()");
  return "#" + hex(matches[1]) + hex(matches[2]) + hex(matches[3]);
}

export type Align = null | "center" | "right";

export type MultimediaKind = "img" | "video" | "audio" | "iframe";

function getAlign(node: HTMLElement): Align | null {
  let align = node.style.textAlign || node.getAttribute("data-align");
  if (align !== "center" && align !== "right") return null;
  return align;
}

function getHeadingAttrs(level: number): (n: string | Element) => Attrs {
  return (n) => ({ level, align: getAlign(n as HTMLElement) });
}

export const schema = new Schema({
  nodes: {
    doc: {
      content: "block+",
    },

    paragraph: {
      content: "inline*",
      group: "block",
      attrs: { align: { default: null } },
      parseDOM: [
        {
          tag: "p",
          getAttrs(n) {
            return { align: getAlign(n as HTMLElement) };
          },
        },
      ],
      toDOM(node) {
        return ["p", { style: `text-align: ${node.attrs.align}` }, 0];
      },
    },

    blockquote: {
      content: "block+",
      group: "block",
      parseDOM: [{ tag: "blockquote" }],
      toDOM() {
        return ["blockquote", 0];
      },
    },

    horizontal_rule: {
      group: "block",
      parseDOM: [{ tag: "hr" }],
      toDOM() {
        return ["div", ["hr"]];
      },
    },

    heading: {
      attrs: { level: { default: 1 }, align: { default: null } },
      content: "text*",
      group: "block",
      defining: true,
      parseDOM: [
        { tag: "h1", getAttrs: getHeadingAttrs(1) },
        { tag: "h2", getAttrs: getHeadingAttrs(2) },
        { tag: "h3", getAttrs: getHeadingAttrs(3) },
        { tag: "h4", getAttrs: getHeadingAttrs(4) },
        { tag: "h5", getAttrs: getHeadingAttrs(5) },
        { tag: "h6", getAttrs: getHeadingAttrs(6) },
      ],
      toDOM(node) {
        return [
          "h" + node.attrs.level,
          { style: `text-align: ${node.attrs.align}` },
          0,
        ];
      },
    },

    code_block: {
      content: "text*",
      group: "block",
      code: true,
      defining: true,
      marks: "",
      attrs: { params: { default: "" } },
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
          getAttrs: (node) => ({
            params: (node as Element).getAttribute("data-params") || "",
          }),
        },
      ],
      toDOM(node) {
        return [
          "pre",
          node.attrs.params ? { "data-params": node.attrs.params } : {},
          ["code", 0],
        ];
      },
    },

    ordered_list: {
      content: "list_item+",
      group: "block",
      attrs: { order: { default: 1 } },
      parseDOM: [
        {
          tag: "ol",
          getAttrs(dom) {
            dom = dom as HTMLElement;
            return {
              order: dom.hasAttribute("start") ? +dom.getAttribute("start") : 1,
            };
          },
        },
      ],
      toDOM(node) {
        return node.attrs.order == 1
          ? ["ol", 0]
          : ["ol", { start: node.attrs.order }, 0];
      },
    },
    bullet_list: {
      content: "list_item+",
      group: "block",
      parseDOM: [{ tag: "ul" }],
      toDOM: () => ["ul", 0],
    },

    list_item: {
      content: "paragraph block*",
      defining: true,
      parseDOM: [{ tag: "li" }],
      toDOM() {
        return ["li", 0];
      },
    },

    text: {
      group: "inline",
    },

    multimedia: {
      group: "block",
      attrs: { src: {}, kind: {} },
      content: "text*",
      parseDOM: [
        {
          tag: "figure",
          getAttrs(dom) {
            const child: HTMLElement =
              (dom as Element).querySelector("img") ||
              (dom as Element).querySelector("video") ||
              (dom as Element).querySelector("audio") ||
              (dom as Element).querySelector("iframe");

            if (child instanceof HTMLImageElement) {
              return { src: child.src, kind: "img" };
            } else if (child instanceof HTMLVideoElement) {
              return { src: child.src, kind: "video" };
            } else if (child instanceof HTMLAudioElement) {
              return { src: child.src, kind: "audio" };
            } else if (child instanceof HTMLIFrameElement) {
              return { src: child.src, kind: "iframe" };
            }
          },
        },
        {
          tag: "img",
          getAttrs(dom) {
            return { src: (dom as HTMLImageElement).src, kind: "img" };
          },
        },
        {
          tag: "video",
          getAttrs(dom) {
            return { src: (dom as HTMLVideoElement).src, kind: "video" };
          },
        },
        {
          tag: "audio",
          getAttrs(dom) {
            return { src: (dom as HTMLAudioElement).src, kind: "audio" };
          },
        },
        {
          tag: "iframe",
          getAttrs(dom) {
            return { src: (dom as HTMLIFrameElement).src, kind: "iframe" };
          },
        },
      ],
      toDOM(node) {
        return [
          "figure",
          [node.attrs.kind, { src: node.attrs.src }],
          ["figcaption", 0],
        ];
      },
      draggable: true,
    },

    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM() {
        return ["br"];
      },
    },
  },

  marks: {
    em: {
      parseDOM: [
        { tag: "i" },
        { tag: "em" },
        { style: "font-style", getAttrs: (value) => value == "italic" && null },
      ],
      toDOM() {
        return ["em"];
      },
    },

    strong: {
      parseDOM: [
        { tag: "b" },
        { tag: "strong" },
        {
          style: "font-weight",
          getAttrs: (value) =>
            /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
        },
      ],
      toDOM() {
        return ["strong"];
      },
    },

    underline: {
      parseDOM: [{ tag: "u" }],
      toDOM() {
        return ["u"];
      },
    },
    strikethrough: {
      parseDOM: [{ tag: "del" }],
      toDOM() {
        return ["del"];
      },
    },
    small: {
      parseDOM: [{ tag: "small" }],
      toDOM() {
        return ["small"];
      },
    },

    mark: {
      attrs: {
        color: { default: "#f206f9" },
      },
      parseDOM: [
        {
          tag: "mark",
          getAttrs(dom) {
            const prop = (dom as HTMLElement).style.backgroundColor;
            const hex = rgbToHex(prop);
            return {
              color: hex,
            };
          },
        },
      ],
      toDOM(node) {
        return ["mark", { style: `background-color:${node.attrs.color}` }];
      },
    },

    link: {
      attrs: {
        href: {},
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs(dom) {
            return {
              href: (dom as Element).getAttribute("href"),
            };
          },
        },
      ],
      toDOM(node) {
        const attrs = {
          ...node.attrs,
          rel: "noopener",
          referrerpolicy: "strict-origin-when-cross-origin",
        };

        return ["a", attrs];
      },
    },
    internal_link: {
      attrs: {
        id: {},
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          // TODO: untested
          getAttrs(dom) {
            dom = dom as HTMLElement;
            const href = dom.getAttribute("href");
            if (href.startsWith("/w/")) {
              return {
                id: parse(routes.Page).pattern.exec(href)[1],
              };
            } else return false;
          },
        },
      ],
      toDOM(node) {
        return [
          "a",
          {
            href: node.attrs.id,
            //inject(routes.Page, {world:})
          },
        ];
      },
    },

    code: {
      parseDOM: [{ tag: "code" }],
      toDOM() {
        return ["code"];
      },
    },
  },
});
