<script lang="ts">
  import type { EditorState } from "prosemirror-state";
  import type { EditorView } from "prosemirror-view";
  import { insertPoint } from "prosemirror-transform";
  import { uploadFile, placeholderPlugin, findPlaceholder } from "../upload";
  import type { NodeType } from "prosemirror-model";
  import type { MultimediaKind } from "../schema";

  export let view: EditorView;
  export let state: EditorState;

  const type = state.schema.nodes.multimedia;
  let inputEl: HTMLInputElement;

  function mimeToKind(mime: string): MultimediaKind {
    if (mime.match(/^image\/.+$/)) {
      return "img";
    } else if (mime.match(/^video\/.+$/)) {
      return "video";
    } else if (mime.match(/^audio\/.+$/)) {
      return "audio";
    } else if (mime.match(/^application\/pdf$/)) {
      return "iframe";
    } else {
      // TODO: chequear si el archivo es válido antes de subir
      throw new Error("Tipo de archivo no reconocido");
    }
  }

  function startUploading() {
    inputEl.click();
  }
  function upload() {
    // TODO: permitir reemplazar el contenido de multimedia de un multimedia
    // ya existente
    if (
      inputEl.files.length > 0 &&
      state.selection.$from.parent.inlineContent
    ) {
      let id = {};
      let tr = view.state.tr;
      const point = insertPoint(state.doc, state.selection.to, type);
      tr.setMeta(placeholderPlugin, { add: { id, pos: point } });
      view.dispatch(tr);

      const file = inputEl.files[0];
      uploadFile(file)
        .then((url) => {
          const placeholderPos = findPlaceholder(view.state, id);
          // si se borró el placeholder, no subir imágen
          if (placeholderPos == null) return;

          const node = state.schema.nodes.multimedia.createChecked(
            {
              src: url,
              kind: mimeToKind(file.type),
            },
            [state.schema.nodes.multimedia_caption.createChecked({})]
          );

          view.dispatch(
            view.state.tr
              .replaceWith(placeholderPos, placeholderPos, node)
              .setMeta(placeholderPlugin, { remove: { id } })
          );
        })
        .catch((err) => {
          console.error(err);
          // TODO: mostrar error
          alert(err);
          view.dispatch(tr.setMeta(placeholderPlugin, { remove: { id } }));
        });
    }
    view.focus();
  }
</script>

<button type="button" on:mousedown|preventDefault={startUploading}
  ><i class={`fa fa-upload`} /></button
>
<input
  type="file"
  bind:this={inputEl}
  on:change|preventDefault={upload}
  hidden
/>
