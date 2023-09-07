<script lang="ts">
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";

  import { commandListener } from "../ps-utils";
  import Button from "./Button.svelte";
  import { chainCommands, setBlockType } from "prosemirror-commands";

  export let view: EditorView;
  export let state: EditorState;
  export let level: number;

  $: type = state.schema.nodes.heading;
  $: paragraphType = state.schema.nodes.paragraph;

  $: isActive =
    state.selection.to <= state.selection.$from.end() &&
    state.selection.$from.parent.type === type &&
    state.selection.$from.parent.attrs.level === level;

  $: listener = commandListener(
    view,
    chainCommands(setBlockType(type, { level }), setBlockType(paragraphType)),
  );
</script>

<Button active={isActive} onClick={listener}>
  <slot />
</Button>
