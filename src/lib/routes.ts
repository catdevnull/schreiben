import navaid from "navaid";
import { writable } from "svelte/store";

import ChooseWorld from "../views/ChooseWorld.svelte";
import CreateWorld from "../views/CreateWorld.svelte";
import NotFound from "../views/NotFound.svelte";
import Page from "../views/Page.svelte";

export let router = navaid("/", () =>
  currentRoute.set({ component: NotFound })
);
export let currentRoute = writable<{
  // XXX: in lack of a better type for Svelte components
  component: any;
  params?: Record<string, string>;
}>({ component: ChooseWorld });

export const routes = {
  ChooseWorld: "/",
  CreateWorld: "/create",
  Page: "/w/:worldId/:pageId",
};

router.on(routes.ChooseWorld, () =>
  currentRoute.set({ component: ChooseWorld })
);
router.on(routes.CreateWorld, () =>
  currentRoute.set({ component: CreateWorld })
);
router.on(routes.Page, (params) =>
  currentRoute.set({ component: Page, params })
);

router.listen();
