import { getTitle } from "./getTitle.js";
import { makeYdocStore } from "./makeYdocStore";

/**
 * @param {import("yjs").Doc} ydoc
 * @param {string} id
 * @returns {import("svelte/store").Readable<string | null>}
 */
export function titleStore(ydoc, id) {
  /** @type {(() => void) | null } */
  let observer = null;
  /** @type {import("yjs").AbstractType<any> | null} */
  let y = null;

  /** @type {string|null} */
  let title = null;

  return makeYdocStore(
    (_, __, ydoc) => {
      const setTitle = () => (title = getTitle(ydoc, id) || null);
      if (!y) {
        setTitle();
        y = ydoc.getXmlFragment(id);
        observer = setTitle;
        y.observeDeep(observer);
      }

      return title;
    },
    () => observer && y?.unobserveDeep(observer),
  )(ydoc);
}
