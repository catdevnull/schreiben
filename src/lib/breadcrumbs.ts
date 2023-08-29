import { derived } from "svelte/store";
import IdbValStore from "./idbValStore";

export type PageParams = {
  worldId: string;
  pageId: string;
};
type WorldId = string;
type PageId = string;

class BreadcrumbsStore {
  idb: IdbValStore<Map<WorldId, PageId[]>>;
  idbLastWorld: IdbValStore<WorldId>;
  constructor() {
    this.idb = new IdbValStore("schreiben-breadcrumbs");
    this.idbLastWorld = new IdbValStore("schreiben-last-world");
  }

  async newCrumb({ worldId, pageId }: PageParams) {
    await this.idbLastWorld.set(worldId);
    await this.idb.update((map) => {
      if (!map) map = new Map();
      let crumbs = map.get(worldId) || [];
      if (crumbs.includes(pageId)) {
        crumbs = crumbs.slice(0, crumbs.indexOf(pageId) + 1);
      } else {
        crumbs.push(pageId);
      }
      map.set(worldId, crumbs);
      return map;
    });
  }

  async lastWorldBreadcrumbs() {
    const map = await this.idb.get();
    const worldId = await this.idbLastWorld.get();
    if (!worldId) return;
    const breadcrumbs = map?.get(worldId);
    if (!breadcrumbs) return;
    return { worldId, breadcrumbs };
  }

  worldStore(worldId: WorldId) {
    return derived(this.idb, (map) => map?.get(worldId) || []);
  }
}

export default new BreadcrumbsStore();
