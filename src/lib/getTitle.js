import { yDocToProsemirrorJSON } from "y-prosemirror";
import { Node } from "prosemirror-model";
import { schema } from "../editor/schema";

/**
 * @param {import("yjs").Doc} ydoc
 * @param {string} name
 * @returns {string=}
 */
export function getTitle(ydoc, name) {
  const json = yDocToProsemirrorJSON(ydoc, name);
  const node = Node.fromJSON(schema, json);
  /** @type {any} */
  let titleNode = null;
  node.descendants((node) => {
    if (titleNode) return false;
    if (node.type.name === "heading" && node.attrs.level === 1) {
      titleNode = node;
      return false;
    }
  });
  if (titleNode) {
    // prettier-ignore
    return /** @type {Node} */(titleNode).textContent;
  }
}
