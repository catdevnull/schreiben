import navaid from "navaid";
import { writable } from "svelte/store";

import ChooseWorld from "../views/ChooseWorld.svelte";
import CreateWorld from "../views/CreateWorld.svelte";
import JoinWorld from "../views/JoinWorld.svelte";
import NotFound from "../views/NotFound.svelte";
import Page from "../views/Page.svelte";
import ShareWorld from "../views/ShareWorld.svelte";
import { routes } from "./routes";

export let currentRoute = writable<{
  // XXX: in lack of a better type for Svelte components
  component: any;
  params?: Record<string, string>;
}>({ component: ChooseWorld });

export let router = navaid("/", () =>
  currentRoute.set({ component: NotFound })
);
router.on(routes.ChooseWorld, () =>
  currentRoute.set({ component: ChooseWorld })
);
router.on(routes.CreateWorld, () =>
  currentRoute.set({ component: CreateWorld })
);
router.on(routes.ShareWorld, (params) =>
  currentRoute.set({ component: ShareWorld, params })
);
router.on(routes.JoinWorld, (params) =>
  currentRoute.set({ component: JoinWorld, params })
);
router.on(routes.Page, (params) =>
  currentRoute.set({ component: Page, params })
);

router.listen();
