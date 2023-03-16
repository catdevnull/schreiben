<script lang="ts">
  import type { MarkType } from "prosemirror-model";
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";
  import { toggleMark } from "prosemirror-commands";

  import { commandListener, markIsActive } from "../ps-utils";
  import Button from "./Button.svelte";

  export let view: EditorView;
  export let state: EditorState;
  export let type: MarkType;
  export let small: boolean = false;

  $: isActive = markIsActive(state, type);
  $: listener = commandListener(view, toggleMark(type));
</script>

<Button active={isActive} onClick={listener}>
  {#if small}
    <small><slot /></small>
  {:else}
    <slot />
  {/if}
</Button>
