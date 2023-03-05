<script lang="ts">
  import { chainCommands } from "prosemirror-commands";

  import { wrapInList } from "prosemirror-schema-list";
  import { liftListItem } from "prosemirror-schema-list";
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";

  import UlIcon from "bootstrap-icons/icons/list-ul.svg";
  import OlIcon from "bootstrap-icons/icons/list-ol.svg";

  import { ListKind } from "../utils";
  import { commandListener, nodeIsActiveFn } from "../ps-utils";

  export let view: EditorView;
  export let state: EditorState;
  export let kind: ListKind;

  $: type =
    kind === ListKind.Unordered
      ? state.schema.nodes.bullet_list
      : kind === ListKind.Ordered
      ? state.schema.nodes.ordered_list
      : null;
  const listItemType = state.schema.nodes.list_item;
  $: iconComponent =
    kind === ListKind.Unordered
      ? UlIcon
      : kind === ListKind.Ordered
      ? OlIcon
      : (console.error("adsfadsf"), UlIcon);

  $: isActive = nodeIsActiveFn(type, null, true);
  $: command = chainCommands(liftListItem(listItemType), wrapInList(type));
  $: isPossible = command(state, null);
  $: actionListener = commandListener(view, command);
</script>

<button
  type="button"
  class:active={isActive(state)}
  on:mousedown={actionListener}
  disabled={!isPossible}><svelte:component this={iconComponent} /></button
>
