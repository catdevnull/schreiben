import { chainCommands, setBlockType } from "prosemirror-commands";
import type {
  Mark,
  MarkType,
  NodeType,
  ResolvedPos,
  Node as ProsemirrorNode,
} from "prosemirror-model";
import type { EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";

export type Command = (
  state: EditorState,
  dispatch?: EditorView["dispatch"],
) => boolean;

// A lot of this is from https://github.com/ueberdosis/tiptap/blob/main/packages/tiptap-commands

export function getMarkRange(
  $pos: ResolvedPos | null = null,
  type: MarkType | null = null,
) {
  if (!$pos || !type) {
    return false;
  }

  const start = $pos.parent.childAfter($pos.parentOffset);

  if (!start.node) {
    return false;
  }

  const link = start.node.marks.find((mark) => mark.type === type);
  if (!link) {
    return false;
  }

  let startIndex = $pos.index();
  let startPos = $pos.start() + start.offset;
  let endIndex = startIndex + 1;
  let endPos = startPos + start.node.nodeSize;

  while (
    startIndex > 0 &&
    link.isInSet($pos.parent.child(startIndex - 1).marks)
  ) {
    startIndex -= 1;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }

  while (
    endIndex < $pos.parent.childCount &&
    link.isInSet($pos.parent.child(endIndex).marks)
  ) {
    endPos += $pos.parent.child(endIndex).nodeSize;
    endIndex += 1;
  }

  return { from: startPos, to: endPos };
}

export function updateMark(type: MarkType, attrs: any): Command {
  return (state, dispatch) => {
    const { tr, selection, doc } = state;

    const { ranges, empty } = selection;

    if (empty) {
      const range = getMarkRange(selection.$from, type);
      if (!range) throw new Error("What the fuck");
      const { from, to } = range;

      if (doc.rangeHasMark(from, to, type)) {
        tr.removeMark(from, to, type);
      }

      tr.addMark(from, to, type.create(attrs));
    } else {
      ranges.forEach((ref$1) => {
        const { $to, $from } = ref$1;

        if (doc.rangeHasMark($from.pos, $to.pos, type)) {
          tr.removeMark($from.pos, $to.pos, type);
        }

        tr.addMark($from.pos, $to.pos, type.create(attrs));
      });
    }

    if (dispatch) {
      dispatch(tr);
    }
    return true;
  };
}

export function removeMark(type: MarkType): Command {
  return (state, dispatch) => {
    const { tr, selection } = state;
    let { from, to } = selection;
    const { $from, empty } = selection;

    if (empty) {
      const range = getMarkRange($from, type);
      if (!range) throw new Error("No");

      from = range.from;
      to = range.to;
    }

    tr.removeMark(from, to, type);

    if (dispatch) {
      dispatch(tr);
    }
    return true;
  };
}

export function toggleNode(
  type: NodeType,
  attrs: any,
  /// es el tipo que se setea si ya es el type querido; probablemente querés
  /// que sea el type de párrafo
  alternateType: NodeType,
): Command {
  return chainCommands(setBlockType(type, attrs), setBlockType(alternateType));
}

export function commandListener(
  view: EditorView,
  command: Command,
): (event: Event) => void {
  return (event) => {
    event.preventDefault();
    command(view.state, view.dispatch);
  };
}

export default function findParentNodeClosestToPos(
  $pos: ResolvedPos,
  predicate: (node: ProsemirrorNode) => boolean,
) {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i);

    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      };
    }
  }
}

export function nodeIsActiveFn(
  type: NodeType,
  attrs?: any,
  checkParents: boolean = false,
): (state: EditorState) => boolean {
  return (state) => {
    let { $from, to } = state.selection;
    return (
      to <= $from.end() &&
      (checkParents
        ? !!findParentNodeClosestToPos($from, (n) => n.type == type)
        : $from.parent.hasMarkup(type, attrs))
    );
  };
}
export function getAttrFn(attrKey: string): (state: EditorState) => any {
  return (state) => {
    let { from, to } = state.selection;
    let value: any = undefined;
    state.doc.nodesBetween(from, to, (node) => {
      if (value !== undefined) return false;
      if (!node.isTextblock) return;
      if (attrKey in node.attrs) value = node.attrs[attrKey];
    });
    return value;
  };
}

export function markIsActive(state: EditorState, type: MarkType): boolean {
  let { from, to } = state.selection;
  return state.doc.rangeHasMark(from, to, type);
}

export interface MarkMatch {
  node: ProsemirrorNode;
  position: number;
  mark: Mark;
}

export function getFirstMarkInSelection(
  state: EditorState,
  type: MarkType,
): MarkMatch | null {
  const { to, from } = state.selection;

  let match: MarkMatch | null = null;
  state.selection.$from.doc.nodesBetween(from, to, (node, position) => {
    if (!match) {
      const mark = type.isInSet(node.marks);
      if (!mark) return;
      match = { node, position, mark };
    }
  });

  return match;
}
