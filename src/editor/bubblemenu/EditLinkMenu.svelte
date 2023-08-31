<script lang="ts">
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";
  import { getFirstMarkInSelection } from "../ps-utils";
  import { readable, type Writable } from "svelte/store";
  import { nanoid } from "nanoid";
  import { markSelectionFloatingUi } from "./floatingUi";
  import { autoPlacement, shift, offset } from "@floating-ui/dom";

  export let state: EditorState;
  export let view: EditorView;
  export let editingLink: Writable<false | "new" | "selection">;

  let hrefInputEl: HTMLInputElement;
  let formEl: HTMLFormElement;

  // ref: https://gitlab.com/gitlab-org/gitlab-foss/-/blob/13d851c795a48b670b859a7ec5bd6e2886d2789e/app/assets/javascripts/content_editor/components/bubble_menus/link_bubble_menu.vue#L69

  let text = "";
  let href = "";

  function onChangeEditingLink(editingLink: false | "new" | "selection") {
    if (!editingLink) return;
    text = "";
    href = "";

    // el timeout... ugh
    hrefInputEl?.focus();
    setTimeout(() => hrefInputEl?.focus(), 50);
    setTimeout(() => hrefInputEl?.focus(), 100);

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

  $: linkMatch =
    state && getFirstMarkInSelection(view.state, view.state.schema.marks.link);
  $: style =
    shown && linkMatch
      ? markSelectionFloatingUi(view, linkMatch, formEl, {
          placement: "top",
          middleware: [offset(6), autoPlacement(), shift({ padding: 5 })],
        })
      : readable("");
</script>

<svelte:document on:pointerdown={detectFocus} />

<form
  class="rounded-lg bg-white shadow-lg"
  style={$style}
  hidden={!shown}
  bind:this={formEl}
  on:submit|preventDefault={onSubmit}
>
  <div class="form-group">
    <label for={`link-text-${id}`} class="col-form-label d-block">Texto</label>
    <input
      class="form-control"
      id={`link-text-${id}`}
      type="text"
      bind:value={text}
    />
  </div>
  <div class="form-group was-validated">
    <label for={`link-href-${id}`} class="col-form-label d-block">Enlace</label>
    <input
      class="form-control"
      id={`link-href-${id}`}
      type="url"
      bind:this={hrefInputEl}
      bind:value={href}
    />
  </div>
  <div class="d-flex justify-content-end buttons">
    <button type="button" class="btn btn-secondary" on:click={cancel}
      >Cancelar</button
    >
    <button type="submit" class="btn btn-primary">Guardar</button>
  </div>
</form>

<style>
  form {
    width: max-content;
    position: absolute;
    z-index: 420;
    padding: 1rem;
  }
  .buttons {
    gap: 0.5rem;
  }
</style>
