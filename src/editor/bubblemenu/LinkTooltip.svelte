<script lang="ts">
  import type { EditorState } from "prosemirror-state";
  import {
    getFirstMarkInSelection,
    getMarkRange,
    removeMark,
    selectMark,
  } from "../ps-utils";
  import type { EditorView } from "prosemirror-view";
  import { markSelectionFloatingUi } from "./floatingUi";
  import { readable, type Writable } from "svelte/store";
  import { flip, shift, offset } from "@floating-ui/dom";
  import EditIcon from "eva-icons/outline/svg/edit-outline.svg";
  import CloseIcon from "eva-icons/fill/svg/close.svg";

  export let state: EditorState;
  export let view: EditorView;
  export let editingLink: Writable<false | "new" | "selection">;

  let tooltipEl: HTMLElement;
  $: markType = view.state.schema.marks.link;
  $: link = state && getFirstMarkInSelection(view.state, markType);
  $: shown = !!link && !$editingLink;

  $: style =
    shown && link
      ? markSelectionFloatingUi(view, link, tooltipEl, {
          placement: "bottom",
          middleware: [offset(6), flip(), shift({ padding: 5 })],
        })
      : readable("");

  function editLink() {
    if (!link) return;
    selectMark(link, view.state, view.dispatch);
    $editingLink = "selection";
  }
  function removeLink() {
    const range = getMarkRange(state.selection.$from, markType);
    if (!range)
      throw new Error("removeLink: Couldn't get mark range to remove");
    view.dispatch(state.tr.removeMark(range.from, range.to, markType));
  }
</script>

<div
  class="x-tooltip bg-gray"
  class:flex={shown}
  class:hidden={!shown}
  bind:this={tooltipEl}
  style={$style}
>
  <!-- TODO: hacer que el clickeable sea relativo a la url final del sitio? -->
  <span>
    <a
      href={link?.mark.attrs.href}
      rel="noopener noreferrer nofollow"
      target="_blank"
    >
      {link?.mark.attrs.href}
    </a>
  </span>
  <button type="button" on:click={editLink} title={"Editar enlace"}>
    <EditIcon class="h-6 w-6 fill-current" />
  </button>
  <button type="button" on:click={removeLink} title={"Borrar enlace"}>
    <CloseIcon class="h-6 w-6 fill-current" />
  </button>
</div>

<style>
  .x-tooltip {
    width: max-content;
    position: absolute;
    background: #222;
    color: white;
    border-radius: 4px;
    z-index: 420;
    line-height: 1;

    align-items: center;
  }
  .x-tooltip > * {
    padding: 0.4rem 0.5rem;
  }
  a {
    display: block;
    color: lightblue;
    max-width: 50vw;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  button {
    background: #222;
    color: white;
    border: none;
    appearance: none;
    font-size: 1.5rem;
    border-radius: 4px;
  }
  button:hover {
    background: #444;
  }
</style>
