<script lang="ts">
  import { wrapIn } from "prosemirror-commands";

  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";

  import BlockquoteIcon from "bootstrap-icons/icons/blockquote-left.svg";

  import { commandListener, nodeIsActiveFn } from "../ps-utils";

  export let view: EditorView;
  export let state: EditorState;

  const type = state.schema.nodes.blockquote;

  $: isActive = nodeIsActiveFn(type, null, true);
  $: command = wrapIn(type);
  $: isPossible = command(state, null);
  $: actionListener = commandListener(view, command);
</script>

<button
  type="button"
  class:active={isActive(state)}
  on:mousedown={actionListener}
  disabled={!isPossible}><BlockquoteIcon /></button
>
