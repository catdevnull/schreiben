<script lang="ts">
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";
  import { getAttrFn, setAlign } from "../ps-utils";
  import type { Align } from "../schema";

  export let view: EditorView;
  export let state: EditorState;

  $: isPossible = setAlign(null)(state, null);
  $: currentValue = getAttrFn("align")(state);

  const onChange = (event) => {
    event.preventDefault();

    const { value } = event.target;
    const align: Align = value === "normal" ? null : value;
    setAlign(align)(state, view.dispatch);
  };
</script>

<select
  value={currentValue === null ? "normal" : currentValue}
  disabled={!isPossible}
  on:change={onChange}
>
  <option value="normal">Normal</option>
  <option value="center">Centro</option>
  <option value="right">Derecha</option>
</select>
