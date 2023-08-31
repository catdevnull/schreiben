<script lang="ts">
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";

  import BlockSelect from "./menubar/BlockSelect.svelte";
  // import UploadItem from "./menubar/UploadItem.svelte";
  import ListItem from "./menubar/ListItem.svelte";
  import BlockQuoteItem from "./menubar/BlockQuoteItem.svelte";
  import { ListKind } from "./utils";

  export let view: EditorView;
  export let state: EditorState;
</script>

<div
  class="sticky top-0 z-50 flex items-center border-b border-neutral-200/60 bg-white px-4 py-2 dark:border-neutral-700 dark:bg-neutral-800"
>
  <BlockSelect {view} {state} />
  <!-- <UploadItem {view} {state} /> -->
  <ListItem {view} {state} kind={ListKind.Unordered} />
  <ListItem {view} {state} kind={ListKind.Ordered} />
  <BlockQuoteItem {view} {state} />
</div>

<style lang="postcss">
  div :global(button) {
    @apply m-1 appearance-none rounded p-2 leading-none transition-colors hover:bg-neutral-600/20 dark:hover:bg-neutral-600/40;
  }
  div :global(button.active) {
    @apply bg-neutral-300 dark:bg-neutral-700;
  }
  div :global(button svg) {
    @apply h-6 w-6;
  }
</style>
