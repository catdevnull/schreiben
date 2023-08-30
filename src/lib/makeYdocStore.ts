import {
  derived,
  type Readable,
  type Subscriber,
  type Unsubscriber,
} from "svelte/store";
import type { Doc, Transaction, XmlFragment } from "yjs";
import { loadWorlds, worldsStore } from "./worldStorage";
import { getWorldPage, getWorldY } from "./doc";

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

export function ydocStore(ydoc: Doc): Readable<{
  update: Uint8Array | null;
  origin: any;
  ydoc: Doc;
  tr: Transaction | null;
}> {
  return {
    subscribe(run) {
      run({ update: null, ydoc, tr: null, origin: null });
      const cb = (update: any, origin: any, ydoc: any, tr: any) =>
        run({ update, origin, ydoc, tr });
      ydoc.on("update", cb);
      return () => {
        ydoc.off("update", cb);
      };
    },
  };
}

export function pageStore(
  worldId: string,
  pageId: string,
): Readable<{ doc: Doc; frag: XmlFragment }> {
  return derived([worldsStore], ([$worlds], set) => {
    const world = $worlds?.find((w) => w.room === worldId);
    if (!world) return;
    const ydoc = getWorldY(world);
    const ydocS = ydocStore(ydoc.ydoc);
    return derived([ydocS], ([{ ydoc }]) => {
      return getWorldPage(ydoc, pageId);
    }).subscribe((frag) => set({ doc: ydoc.ydoc, frag }));
  });
}
