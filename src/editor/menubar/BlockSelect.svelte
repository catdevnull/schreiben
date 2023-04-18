<script lang="ts">
  import type { NodeType } from "prosemirror-model";
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";
  import { setBlockType } from "prosemirror-commands";

  export let view: EditorView;
  export let state: EditorState;

  const paragraphType = state.schema.nodes.paragraph;
  const headingType = state.schema.nodes.heading;

  $: isPossible = setBlockType(headingType, { level: 1 })(state);
  $: currentValue =
    state.selection.to <= state.selection.$from.end() &&
    (state.selection.$from.parent.type == headingType
      ? `heading:${state.selection.$from.parent.attrs.level}`
      : state.selection.$from.parent.type == paragraphType
      ? "paragraph"
      : null);

  const onChange = (
    event: Event & { currentTarget: EventTarget & HTMLSelectElement }
  ) => {
    event.preventDefault();

    const [type, param] = event.currentTarget.value.split(":");
    if (type === "paragraph") {
      setBlockType(paragraphType, {
        align: state.selection.$from.parent.attrs.align,
      })(state, view.dispatch);
    } else if (type === "heading") {
      setBlockType(headingType, {
        level: parseInt(param),
        align: state.selection.$from.parent.attrs.align,
      })(state, view.dispatch);
    } else {
      console.error(`¡type no es heading ni paragraph! Es`, type);
    }
  };
</script>

<select value={currentValue} on:change={onChange}>
  <option value="paragraph">Párrafo</option>
  <option value="heading:1">Titulo grande</option>
  <option value="heading:2">Titulo mediano</option>
  <option value="heading:3">Subtitulo</option>
  <option value="heading:4">Subsubtitulo</option>
  <option value="heading:5">Subsubsubtitulo</option>
  <option value="heading:6">Subsubsubsubtitulo</option>
</select>
