<script lang="ts">
  import type { Writable } from "svelte/store";
  import type { EditorView } from "prosemirror-view";
  import type { EditorState } from "prosemirror-state";

  import BoldIcon from "bootstrap-icons/icons/type-bold.svg";
  import ItalicIcon from "bootstrap-icons/icons/type-italic.svg";
  import UnderlineIcon from "bootstrap-icons/icons/type-underline.svg";
  import StrikethroughIcon from "bootstrap-icons/icons/type-strikethrough.svg";
  import LinkIcon from "eva-icons/outline/svg/external-link-outline.svg";
  import InternalLinkIcon from "eva-icons/outline/svg/menu-arrow-outline.svg";
  import H2Icon from "bootstrap-icons/icons/type-h2.svg";
  import H3Icon from "bootstrap-icons/icons/type-h3.svg";

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
  import BottomFloatingBar from "../components/BottomFloatingBar.svelte";
  import type { WorldY } from "../lib/doc";
  import Linking from "./bubblemenu/Linking.svelte";
  import HeadingButton from "./bubblemenu/HeadingButton.svelte";

  export let view: EditorView;
  export let state: EditorState;
  export let worldY: WorldY;
  export let editingLink: Writable<false | "new" | "selection">;

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
</script>

{#if makingInternalLink}
  <Modal onClose={() => (makingInternalLink = false)}>
    <svelte:fragment slot="title">Elegir página</svelte:fragment>
    <PagePicker ydoc={worldY.ydoc} onChoose={makeInternalLink} />
  </Modal>
{/if}

<BottomFloatingBar>
  <Linking {state} />
  <div class="bubble flex items-center" hidden={state.selection.empty}>
    <SimpleMarkItem {view} {state} type={view.state.schema.marks.strong}>
      <BoldIcon style={svgStyle} />
    </SimpleMarkItem>
    <SimpleMarkItem {view} {state} type={view.state.schema.marks.em}>
      <ItalicIcon style={svgStyle} />
    </SimpleMarkItem>
    <SimpleMarkItem {view} {state} type={view.state.schema.marks.underline}>
      <UnderlineIcon style={svgStyle} />
    </SimpleMarkItem>
    <SimpleMarkItem {view} {state} type={view.state.schema.marks.strikethrough}>
      <StrikethroughIcon style={svgStyle} />
    </SimpleMarkItem>
    <Button
      active={markIsActive(state, view.state.schema.marks.link)}
      onClick={startEditingLink}
    >
      <LinkIcon style={svgStyle} />
    </Button>
    <Button
      active={markIsActive(state, view.state.schema.marks.internal_link)}
      onClick={startMakingInternalLink}
    >
      <InternalLinkIcon style={svgStyle} />
    </Button>

    <span class="mx-2 block h-6 border-r border-neutral-400" />

    <HeadingButton {view} {state} level={2}>
      <H2Icon style={svgStyle} />
    </HeadingButton>
    <HeadingButton {view} {state} level={3}>
      <H3Icon style={svgStyle} />
    </HeadingButton>
  </div>
</BottomFloatingBar>

<style>
  .bubble {
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
