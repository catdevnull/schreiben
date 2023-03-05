<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { keymap } from "prosemirror-keymap";
  import { EditorState, Plugin } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";
  import { dropCursor } from "prosemirror-dropcursor";
  import { gapCursor } from "prosemirror-gapcursor";
  import { DOMParser, DOMSerializer } from "prosemirror-model";
  import type { XmlFragment } from "yjs";
  import {
    ySyncPlugin,
    yCursorPlugin,
    yUndoPlugin,
    undo,
    redo,
  } from "y-prosemirror";

  import "./editor.css";

  import { schema } from "./schema";
  import BubbleMenu from "./BubbleMenu.svelte";
  import MenuBar from "./MenuBar.svelte";
  import { placeholderPlugin } from "./upload";
  import { baseKeymap } from "./keymap";

  export let doc: XmlFragment;

  let wrapperEl: HTMLElement;

  function createState(doc: XmlFragment): EditorState {
    return EditorState.create({
      schema,
      plugins: [
        new Plugin({
          view: (editorView) => {
            // editorView.dom.parentElement?.replaceWith(editorView.dom);
            return {
              update(view, lastState) {
                if (
                  lastState &&
                  lastState.doc.eq(view.state.doc) &&
                  lastState.selection.eq(view.state.selection)
                ) {
                  return;
                }
                updatedState = view.state;
              },
            };
          },
        }),
        dropCursor(),
        gapCursor(),
        //menubar(schema),
        // history(),
        ySyncPlugin(doc),
        // yCursorPlugin(doc.webrtcProvider.awareness),
        yUndoPlugin(),
        keymap(baseKeymap),
        placeholderPlugin,
      ],
    });
  }
  let state = createState(doc);
  $: state = createState(doc);
  let updatedState: EditorState = state;

  let view: EditorView;
  $: {
    if (view) view.destroy();
    view = new EditorView(wrapperEl, { state });
  }
</script>

<div class="editor">
  {#if view}
    <BubbleMenu {view} state={updatedState} />
    <MenuBar {view} state={updatedState} />
  {/if}
  <!-- this element gets replaced with the editor itself when mounted -->
  <div bind:this={wrapperEl} />
</div>
