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
  class="absolute z-30 w-max items-center overflow-hidden rounded border border-neutral-200/70 bg-white px-1 leading-none shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
  class:flex={shown}
  class:hidden={!shown}
  bind:this={tooltipEl}
  style={$style}
>
  <span class=" ">
    <a
      class="block max-w-[50vw] overflow-x-hidden text-ellipsis whitespace-nowrap p-2 text-blue-500 dark:text-blue-300"
      href={link?.mark.attrs.href}
      rel="noopener noreferrer nofollow"
      target="_blank"
    >
      {link?.mark.attrs.href}
    </a>
  </span>
  <button
    class="my-1 appearance-none rounded border-none p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
    type="button"
    on:click={editLink}
    title={"Editar enlace"}
  >
    <EditIcon class="h-6 w-6 fill-current" />
  </button>
  <button
    class="my-1 appearance-none rounded border-none p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700"
    type="button"
    on:click={removeLink}
    title={"Borrar enlace"}
  >
    <CloseIcon class="h-6 w-6 fill-current" />
  </button>
</div>
