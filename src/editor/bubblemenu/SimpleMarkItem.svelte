<script lang="ts">
  import type { MarkType } from "prosemirror-model";
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";
  import { toggleMark } from "prosemirror-commands";

  import { commandListener, markIsActive } from "../ps-utils";

  export let view: EditorView;
  export let state: EditorState;
  export let type: MarkType;
  export let small: boolean = false;

  $: isActive = markIsActive(state, type);
  $: listener = commandListener(view, toggleMark(type));
</script>

<button type="button" class:active={isActive} on:mousedown={listener}>
  {#if small}
    <small><slot /></small>
  {:else}
    <slot />
  {/if}
</button>
