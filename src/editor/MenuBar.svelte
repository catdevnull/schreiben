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

<div class="menubar sticky top-0 flex py-2 px-4 z-50 items-center">
  <BlockSelect {view} {state} />
  <!-- <UploadItem {view} {state} /> -->
  <ListItem {view} {state} kind={ListKind.Unordered} />
  <ListItem {view} {state} kind={ListKind.Ordered} />
  <BlockQuoteItem {view} {state} />
</div>

<style>
  .menubar {
    background: var(--background, white);
    border-bottom: 1px solid var(--accent-bg);
  }
</style>
