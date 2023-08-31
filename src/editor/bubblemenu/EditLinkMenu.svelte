<script lang="ts">
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";
  import { getFirstMarkInSelection } from "../ps-utils";
  import { readable, type Writable } from "svelte/store";
  import { nanoid } from "nanoid";
  import { linkFloatingUi, selectionFloatingUi } from "./floatingUi";
  import {
    autoPlacement,
    shift,
    offset,
    type ComputePositionConfig,
  } from "@floating-ui/dom";

  export let state: EditorState;
  export let view: EditorView;
  export let editingLink: Writable<false | "new" | "selection">;

  let formEl: HTMLFormElement;

  // ref: https://gitlab.com/gitlab-org/gitlab-foss/-/blob/13d851c795a48b670b859a7ec5bd6e2886d2789e/app/assets/javascripts/content_editor/components/bubble_menus/link_bubble_menu.vue#L69

  let text = "";
  let href = "";

  function onChangeEditingLink(editingLink: false | "new" | "selection") {
    if (!editingLink) return;
    text = "";
    href = "";

    if (editingLink === "selection") {
      // https://gitlab.com/gitlab-org/gitlab-foss/-/blob/13d851c795a48b670b859a7ec5bd6e2886d2789e/app/assets/javascripts/content_editor/components/bubble_menus/link_bubble_menu.vue#L69
      text = getSelectionText(view.state);
      const match = getFirstMarkInSelection(
        view.state,
        view.state.schema.marks.link,
      );
      if (!match) return;
      href = match.mark.attrs.href;
    }
  }
  $: onChangeEditingLink($editingLink);

  function onSubmit() {
    const { from, to } = view.state.selection;
    const mark = view.state.schema.marks.link.create({ href });

    if ($editingLink === "new") {
      view.dispatch(
        view.state.tr
          .ensureMarks([mark])
          .insertText(text, from, from)
          .removeStoredMark(mark),
      );
    } else if ($editingLink === "selection") {
      let tr = view.state.tr;
      tr.addMark(from, to, mark);
      const currentText = getSelectionText(view.state);
      if (currentText !== text)
        tr.ensureMarks([mark])
          .insertText(text, from, to)
          .removeStoredMark(mark);

      view.dispatch(tr);
    }

    $editingLink = false;
  }
  function cancel() {
    $editingLink = false;
  }

  function detectFocus(event: any) {
    if (!formEl.contains(event.target)) cancel();
  }

  function getSelectionText(state: EditorState) {
    return state.doc.textBetween(state.selection.from, state.selection.to, " ");
  }
  const id = nanoid();

  $: shown = !!$editingLink;

  $: style = shown
    ? selectionFloatingUi(formEl, {
        placement: "top",
        middleware: [offset(6), autoPlacement(), shift({ padding: 5 })],
      })
    : readable("");
</script>

<svelte:document on:pointerdown={detectFocus} />

<form
  class="absolute z-50 w-max rounded-lg border border-neutral-200/70 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
  style={$style}
  hidden={!shown}
  bind:this={formEl}
  on:submit|preventDefault={onSubmit}
>
  <div class="mb-4">
    <label for={`link-text-${id}`} class="block">Texto</label>
    <input class="input" id={`link-text-${id}`} type="text" bind:value={text} />
  </div>
  <div class="mb-4">
    <label for={`link-href-${id}`} class="block">Enlace</label>
    <input
      class="input"
      id={`link-href-${id}`}
      type="url"
      autofocus
      bind:value={href}
    />
  </div>
  <div class="flex justify-end gap-2">
    <button class="btn-outline" type="button" on:click={cancel}>Cancelar</button
    >
    <button class="btn" type="submit">Guardar</button>
  </div>
</form>
