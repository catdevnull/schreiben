<script lang="ts">
  import { keymap } from "prosemirror-keymap";
  import { EditorState, Plugin } from "prosemirror-state";
  import { EditorView } from "prosemirror-view";
  import { dropCursor } from "prosemirror-dropcursor";
  import { gapCursor } from "prosemirror-gapcursor";
  import { history } from "prosemirror-history";
  import type { XmlFragment } from "yjs";
  import { ySyncPlugin } from "y-prosemirror";

  import "./editor.css";

  import { schema } from "./schema";
  import BubbleMenu from "./BubbleMenu.svelte";
  import MenuBar from "./MenuBar.svelte";
  // import { placeholderPlugin } from "./upload";
  import { baseKeymap } from "./keymap";
  import type { WorldY } from "../lib/doc";

  export let doc: XmlFragment;
  export let worldY: WorldY;

  let wrapperEl: HTMLElement;

  function createState(doc: XmlFragment): EditorState {
    return EditorState.create({
      schema,
      plugins: [
        new Plugin({
          view: () => {
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
        history(),
        ySyncPlugin(doc),
        // yCursorPlugin(doc.webrtcProvider.awareness),
        // yUndoPlugin(),
        keymap(baseKeymap),
        // placeholderPlugin,
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

<div class="editor min-h-screen">
  {#if view}
    <MenuBar {view} state={updatedState} />
  {/if}
  <!-- this element gets replaced with the editor itself when mounted -->
  <div class="prose before:prose-p:content-none after:prose-p:content-none prose-blockquote:font-normal prose-blockquote:not-italic max-w-none min-h-screen" bind:this={wrapperEl} />
  {#if view}
    <BubbleMenu {view} {worldY} state={updatedState} />
  {/if}
</div>

<style>
  :global(.ProseMirror) {
    min-height: 100vh;
  }
</style>
