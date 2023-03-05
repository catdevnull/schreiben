import { EditorState, Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { h } from "./utils";

export function uploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    reject("TODO: implementar subidas");
  });
}

export const placeholderPlugin = new Plugin({
  state: {
    init(): DecorationSet {
      return DecorationSet.empty;
    },
    apply(tr, set: DecorationSet) {
      // Adjust decoration positions to changes made by the transaction
      set = set.map(tr.mapping, tr.doc);
      // See if the transaction adds or removes any placeholders
      let action = tr.getMeta(this);
      if (action && action.add) {
        let widgetEl = h("div", { class: "ProseMirror-placeholder" }, [
          "Subiendo archivo...",
        ]);
        let deco = Decoration.widget(action.add.pos, widgetEl, {
          id: action.add.id,
        });
        set = set.add(tr.doc, [deco]);
      } else if (action && action.remove) {
        set = set.remove(
          set.find(undefined, undefined, (spec) => spec.id == action.remove.id)
        );
      }
      return set;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

export function findPlaceholder(state: EditorState, id: any): number | null {
  const decos: DecorationSet = placeholderPlugin.getState(state);
  const found = decos.find(undefined, undefined, (spec) => spec.id == id);
  return found.length ? found[0].from : null;
}
