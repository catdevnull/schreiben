import type { Readable } from "svelte/store";
import type { Doc, Transaction } from "yjs";

export function makeYdocStore<T>(
  handler: (
    update: Uint8Array | null,
    origin: any,
    ydoc: Doc,
    tr: Transaction | null,
  ) => T,
  unhandler?: () => void,
) {
  return (ydoc: Doc): Readable<T> => {
    // thanks https://github.com/relm-us/svelt-yjs/blob/main/src/types/array.ts
    return {
      subscribe: (run) => {
        function updateHandler(
          update: Uint8Array | null,
          origin: any,
          ydoc: Doc,
          tr: Transaction | null,
        ) {
          run(handler(update, origin, ydoc, tr));
        }
        ydoc.on("update", updateHandler);
        updateHandler(null, null, ydoc, null);
        return () => {
          if (unhandler) unhandler();
          ydoc.off("update", updateHandler);
        };
      },
    };
  };
}
