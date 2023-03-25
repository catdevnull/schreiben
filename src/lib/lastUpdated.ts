import type { AbstractType, Doc } from "yjs";
import { makeYdocStore } from "./makeYdocStore.js";

// XXX: si hay problemas de perf, mirar acá..
// después de implementar esto me di cuenta que simplemente puedo fijarme en
// cuales fueron las últimas páginas a las que se entró, y probablemente sería más útil.

export function lastUpdated(ydoc: Doc) {
  let map: Map<string, Date> = new Map();
  let observers: Set<{ y: AbstractType<any>; observer: () => void }> =
    new Set();
  return makeYdocStore(
    (_, __, ydoc) => {
      for (const name of ydoc.share.keys()) {
        if (name.startsWith("page/")) {
          if (!map.get(name)) {
            map.set(name, new Date());
            const y = ydoc.getXmlFragment(name);
            const observer = () => map.set(name, new Date());
            observers.add({ y, observer });
            y.observeDeep(observer);
          }
        }
      }
      return map;
    },
    () => observers.forEach(({ y, observer }) => y.unobserveDeep(observer))
  )(ydoc);
}
