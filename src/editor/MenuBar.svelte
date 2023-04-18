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

<div class="menubar">
  <BlockSelect {view} {state} />
  <!-- <UploadItem {view} {state} /> -->
  <ListItem {view} {state} kind={ListKind.Unordered} />
  <ListItem {view} {state} kind={ListKind.Ordered} />
  <BlockQuoteItem {view} {state} />
</div>

<style>
  .menubar {
    position: sticky;
    top: 0px;
    z-index: 69;

    display: flex;

    background: var(--background, white);
    border-bottom: 1px solid var(--accent-bg);
  }
</style>
