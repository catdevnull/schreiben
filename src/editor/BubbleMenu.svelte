<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import type { EditorView } from "prosemirror-view";
  import { EditorState, TextSelection } from "prosemirror-state";

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
    getFirstMarkInSelection,
  } from "./ps-utils";
  import SimpleMarkItem from "./bubblemenu/SimpleMarkItem.svelte";
  import { nanoid } from "nanoid";
  import Button from "./bubblemenu/Button.svelte";

  export let view: EditorView;
  export let state: EditorState;

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

  function startEditingLink() {
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

  /* https://wicg.github.io/visual-viewport/examples/fixed-to-keyboard.html */
  let barStyle = "";
  function updateBar() {
    const viewport = window.visualViewport;
    // Since the bar is position: fixed we need to offset it by the
    // visual viewport's offset from the layout viewport origin.
    const offsetY = window.innerHeight - viewport.height - viewport.offsetTop;

    barStyle = `
left: ${viewport.offsetLeft}px;
bottom: ${offsetY}px;
transform: scale(${1 / viewport.scale});
`;
  }

  onMount(() => {
    window.visualViewport.addEventListener("resize", updateBar);
    window.visualViewport.addEventListener("scroll", updateBar);
  });
  onDestroy(() => {
    window.visualViewport.removeEventListener("resize", updateBar);
    window.visualViewport.removeEventListener("scroll", updateBar);
  });
</script>

<div class="bubble" hidden={state.selection.empty} style={barStyle}>
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
    <Button
      active={markIsActive(state, view.state.schema.marks.link)}
      onClick={startEditingLink}><LinkIcon style={svgStyle} /></Button
    >
    <Button
      active={markIsActive(state, view.state.schema.marks.internal_link)}
      onClick={createInternalLink}><InternalLinkIcon style={svgStyle} /></Button
    >
  {:else if changingProp.type === "link"}
    <input
      bind:this={linkInputEl}
      type="text"
      placeholder="https://"
      on:change|preventDefault={onChangeLink}
      value={changingProp.url}
    />
    <Button title="Borrar enlace" onClick={removeLink}
      ><CloseIcon style={svgStyle} /></Button
    >
  {/if}
</div>

<style>
  .bubble {
    display: flex;
    position: fixed;
    left: 0px;
    bottom: 0px;
    padding: 0rem;
    /* https://wicg.github.io/visual-viewport/examples/fixed-to-keyboard.html */
    transform-origin: left bottom;

    background: white;
    border-top: 1px solid #ccc;
    width: 100%;

    visibility: visible;
    opacity: 1;

    transition: opacity 0.2s, visibility 0.2s;
  }
  .bubble[hidden] {
    visibility: hidden;
    opacity: 0;
  }

  .bubble input {
    appearance: none;
    background: none;
    color: inherit;
    border: none;
    font-size: 1.25em;
  }
</style>
