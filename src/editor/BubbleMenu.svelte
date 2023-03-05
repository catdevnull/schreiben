<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import type { EditorView } from "prosemirror-view";
  import { EditorState, TextSelection } from "prosemirror-state";
  import type { Node as ProsemirrorNode } from "prosemirror-model";
  import { toggleMark } from "prosemirror-commands";
  import type { Mark } from "prosemirror-model";

  import BoldIcon from "bootstrap-icons/icons/type-bold.svg";
  import ItalicIcon from "bootstrap-icons/icons/type-italic.svg";
  import UnderlineIcon from "bootstrap-icons/icons/type-underline.svg";
  import StrikethroughIcon from "bootstrap-icons/icons/type-strikethrough.svg";
  import LinkIcon from "bootstrap-icons/icons/box-arrow-up-right.svg";
  import InternalLinkIcon from "bootstrap-icons/icons/folder-symlink.svg";
  import CloseIcon from "bootstrap-icons/icons/x.svg";

  import type { Command } from "./ps-utils";
  import {
    updateMark,
    removeMark,
    markIsActive,
    commandListener,
    getFirstMarkInSelection,
  } from "./ps-utils";
  import { refreshCoords as _refreshCoords } from "./bubblemenu/coords";
  import SimpleMarkItem from "./bubblemenu/SimpleMarkItem.svelte";
  import { nanoid } from "nanoid";

  export let view: EditorView;
  export let state: EditorState;

  // == Posicionamiento ==
  let bubbleEl: HTMLElement = null;
  let left: number = 0;
  let bottom: number = 0;

  function refreshCoords() {
    const coords = _refreshCoords(view, bubbleEl);
    left = coords.left;
    bottom = coords.bottom;
  }

  $: {
    // refrescar cuando cambia state
    view;
    state;
    if (bubbleEl) refreshCoords();
  }

  let resizeObserver = new ResizeObserver(() => {
    if (bubbleEl) refreshCoords();
  });
  $: {
    view;
    resizeObserver.disconnect();
    if (bubbleEl) {
      resizeObserver.observe(bubbleEl.parentElement);
    }
  }
  onDestroy(() => resizeObserver.disconnect());
  // == /Posicionamiento ==

  let changingProp:
    | false
    | { type: "link"; url: string }
    | { type: "mark" }
    | { type: "mark-custom"; color: string } = false;

  let linkInputEl: HTMLElement;

  $: {
    if (state.selection.empty) {
      changingProp = false;
    }
    if (changingProp && changingProp.type === "link") {
      tick().then(() => {
        linkInputEl.focus();
      });
    } else {
      view.focus();
    }
  }

  function runCommand(command: Command) {
    command(state, view.dispatch);
  }

  function startEditingLink(event: Event) {
    const { to, from } = state.selection;
    const match = getFirstMarkInSelection(state, view.state.schema.marks.link);

    // si no hay un link en la selección, empezar a editar uno sin ningún enlace
    // TODO: quizás queremos poner algo tipo https://sutty.nl por defecto?
    if (!match) {
      changingProp = { type: "link", url: "" };
      return;
    }

    view.dispatch(
      state.tr.setSelection(
        TextSelection.create(
          state.doc,
          match.position,
          match.position + match.node.nodeSize
        )
      )
    );
    changingProp = { type: "link", url: match.mark.attrs.href };
  }

  function removeLink() {
    changingProp = false;
    runCommand(removeMark(view.state.schema.marks.link));
  }

  function onChangeLink(event: Event) {
    changingProp = false;
    const url = (event.target as HTMLInputElement).value;
    runCommand(updateMark(view.state.schema.marks.link, { href: url }));
  }

  function createInternalLink() {
    const pageId = nanoid();
    runCommand(
      updateMark(view.state.schema.marks.internal_link, { id: pageId })
    );
  }

  const svgStyle = "width: 100%; height: 100%";
</script>

<div
  bind:this={bubbleEl}
  class="bubble"
  hidden={state.selection.empty}
  style="left: {left}px; bottom: {bottom}px"
>
  {#if changingProp === false}
    <SimpleMarkItem {view} {state} type={view.state.schema.marks.strong}
      ><BoldIcon style={svgStyle} /></SimpleMarkItem
    >
    <SimpleMarkItem {view} {state} type={view.state.schema.marks.em}
      ><ItalicIcon style={svgStyle} /></SimpleMarkItem
    >
    <SimpleMarkItem {view} {state} type={view.state.schema.marks.underline}
      ><UnderlineIcon style={svgStyle} /></SimpleMarkItem
    >
    <SimpleMarkItem {view} {state} type={view.state.schema.marks.strikethrough}
      ><StrikethroughIcon style={svgStyle} /></SimpleMarkItem
    >
    <button
      type="button"
      class:active={markIsActive(state, view.state.schema.marks.link)}
      on:mousedown|preventDefault={startEditingLink}
      ><LinkIcon style={svgStyle} /></button
    >
    <button
      type="button"
      class:active={markIsActive(state, view.state.schema.marks.internal_link)}
      on:mousedown|preventDefault={createInternalLink}
      ><InternalLinkIcon style={svgStyle} /></button
    >
  {:else if changingProp.type === "link"}
    <input
      bind:this={linkInputEl}
      type="text"
      placeholder="https://"
      on:change|preventDefault={onChangeLink}
      value={changingProp.url}
    />
    <button
      type="button"
      title="Borrar enlace"
      on:mousedown|preventDefault={removeLink}
      ><CloseIcon style={svgStyle} /></button
    >
  {/if}
</div>
