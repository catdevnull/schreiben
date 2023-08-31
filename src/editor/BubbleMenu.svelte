<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import type { Writable } from "svelte/store";
  import type { EditorView } from "prosemirror-view";
  import { EditorState, TextSelection } from "prosemirror-state";

  import BoldIcon from "bootstrap-icons/icons/type-bold.svg";
  import ItalicIcon from "bootstrap-icons/icons/type-italic.svg";
  import UnderlineIcon from "bootstrap-icons/icons/type-underline.svg";
  import StrikethroughIcon from "bootstrap-icons/icons/type-strikethrough.svg";
  import LinkIcon from "eva-icons/outline/svg/external-link-outline.svg";
  import InternalLinkIcon from "eva-icons/outline/svg/menu-arrow-outline.svg";
  import CloseIcon from "eva-icons/outline/svg/close-outline.svg";

  import type { Command } from "./ps-utils";
  import {
    updateMark,
    removeMark,
    markIsActive,
    getFirstMarkInSelection,
    selectMark,
  } from "./ps-utils";
  import SimpleMarkItem from "./bubblemenu/SimpleMarkItem.svelte";
  import Button from "./bubblemenu/Button.svelte";
  import Modal from "../components/Modal.svelte";
  import PagePicker from "../components/PagePicker.svelte";
  import type { WorldY } from "../lib/doc";
  import Linking from "./menubar/Linking.svelte";

  export let view: EditorView;
  export let state: EditorState;
  export let worldY: WorldY;
  export let editingLink: Writable<false | "new" | "selection">;

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
    const match = getFirstMarkInSelection(
      view.state,
      view.state.schema.marks.link,
    );
    if (match) {
      selectMark(match, view.state, view.dispatch);
      $editingLink = "selection";
    } else if (!view.state.selection.empty) {
      $editingLink = "selection";
    } else {
      runCommand(removeMark(view.state.schema.marks.link));
      $editingLink = "new";
    }
  }

  let makingInternalLink = false;
  function startMakingInternalLink() {
    if (markIsActive(state, view.state.schema.marks.internal_link)) {
      runCommand(removeMark(view.state.schema.marks.internal_link));
    } else {
      makingInternalLink = true;
    }
  }
  function makeInternalLink(id: string) {
    runCommand(updateMark(view.state.schema.marks.internal_link, { id }));
    makingInternalLink = false;
  }

  const svgStyle = "width: 100%; height: 100%";

  /* https://wicg.github.io/visual-viewport/examples/fixed-to-keyboard.html */
  let barStyle = "";
  function updateBar() {
    const viewport = window.visualViewport!;
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
    window.visualViewport!.addEventListener("resize", updateBar);
    window.visualViewport!.addEventListener("scroll", updateBar);
  });
  onDestroy(() => {
    window.visualViewport!.removeEventListener("resize", updateBar);
    window.visualViewport!.removeEventListener("scroll", updateBar);
  });
</script>

{#if makingInternalLink}
  <Modal onClose={() => (makingInternalLink = false)}>
    <svelte:fragment slot="title">Elegir página</svelte:fragment>
    <PagePicker ydoc={worldY.ydoc} onChoose={makeInternalLink} />
  </Modal>
{/if}

<div class="floating z-40" style={barStyle}>
  <Linking {state} />
  <div class="bubble" hidden={state.selection.empty}>
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
      <SimpleMarkItem
        {view}
        {state}
        type={view.state.schema.marks.strikethrough}
        ><StrikethroughIcon style={svgStyle} /></SimpleMarkItem
      >
      <Button
        active={markIsActive(state, view.state.schema.marks.link)}
        onClick={startEditingLink}><LinkIcon style={svgStyle} /></Button
      >
      <Button
        active={markIsActive(state, view.state.schema.marks.internal_link)}
        onClick={startMakingInternalLink}
        ><InternalLinkIcon style={svgStyle} /></Button
      >
    {/if}
  </div>
</div>

<style>
  .floating {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0px;
    bottom: 0px;
    padding: 0rem;
    /* https://wicg.github.io/visual-viewport/examples/fixed-to-keyboard.html */
    transform-origin: left bottom;

    width: 100%;
  }

  .bubble {
    display: flex;

    background: var(--background);
    border-top: 1px solid var(--accent-bg);
    width: 100%;

    visibility: visible;
    opacity: 1;
    height: auto;

    transition:
      opacity 0.2s,
      visibility 0.2s,
      height 0.2s;
  }
  .bubble[hidden] {
    visibility: hidden;
    opacity: 0;
    height: 0;
  }
</style>
