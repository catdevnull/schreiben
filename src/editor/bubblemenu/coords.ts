import type { EditorView } from "prosemirror-view";

function textRange(
  node: Node,
  from: number = 0,
  to: number | null = null
): Range {
  const range = document.createRange();
  range.setEnd(node, to == null ? node.nodeValue.length : to);
  range.setStart(node, Math.max(from, 0));
  return range;
}

function singleRect(object: Element | Range, bias: number) {
  const rects = object.getClientRects();
  return !rects.length
    ? object.getBoundingClientRect()
    : rects[bias < 0 ? 0 : rects.length - 1];
}

interface Coords {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

function coordsAtPos(
  view: EditorView,
  pos: number,
  end: boolean = false
): Coords {
  const { node, offset } = (view as any).docView.domFromPos(pos);
  let side: "left" | "right";
  let rect: DOMRect;
  if (node.nodeType === 3) {
    if (end && offset < node.nodeValue.length) {
      rect = singleRect(textRange(node, offset - 1, offset), -1);
      side = "right";
    } else if (offset < node.nodeValue.length) {
      rect = singleRect(textRange(node, offset, offset + 1), -1);
      side = "left";
    }
  } else if (node.firstChild) {
    if (offset < node.childNodes.length) {
      const child = node.childNodes[offset];
      rect = singleRect(child.nodeType === 3 ? textRange(child) : child, -1);
      side = "left";
    }
    if ((!rect || rect.top === rect.bottom) && offset) {
      const child = node.childNodes[offset - 1];
      rect = singleRect(child.nodeType === 3 ? textRange(child) : child, 1);
      side = "right";
    }
  } else {
    rect = node.getBoundingClientRect();
    side = "left";
  }
  const x = rect[side];

  return {
    top: rect.top,
    bottom: rect.bottom,
    left: x,
    right: x,
  };
}

export function refreshCoords(view: EditorView, bubbleEl: HTMLElement) {
  // Brutally stolen from https://github.com/ueberdosis/tiptap/blob/d2cf88fd166092d6df079cb47fe2a55520fadf80/packages/tiptap/src/Plugins/MenuBubble.js
  const { from, to } = view.state.selection;

  // These are in screen coordinates
  // We can't use EditorView.coordsAtPos here because it can't handle linebreaks correctly
  // See: https://github.com/ProseMirror/prosemirror-view/pull/47
  const start = coordsAtPos(view, from);
  const end = coordsAtPos(view, to, true);

  // The box in which the tooltip is positioned, to use as base
  const parent = bubbleEl.offsetParent;

  if (!parent) {
    console.error(
      "Me parece que te falto importar el CSS. `import '@suttyweb/editor/dist/style.css';`"
    );
    // TODO: i18n
    throw new Error(
      "¡El editor tuvo un error! Contactar a lxs desarrolladorxs."
    );
  }

  const box = parent.getBoundingClientRect();
  const el = bubbleEl.getBoundingClientRect();

  const _left = Math.max((start.left + end.left) / 2 - box.left, el.width / 2);

  return {
    left: Math.round(
      _left + el.width / 2 > box.width ? box.width - el.width / 2 : _left
    ),
    bottom: Math.round(box.bottom - start.top),
    top: Math.round(end.bottom - box.top),
  };
}
