import navaid from "navaid";
import { writable } from "svelte/store";

import ChooseWorld from "../views/ChooseWorld.svelte";
import CreateWorld from "../views/CreateWorld.svelte";
import JoinWorld from "../views/JoinWorld.svelte";
import NotFound from "../views/NotFound.svelte";
import Page from "../views/Page.svelte";
import ShareWorld from "../views/ShareWorld.svelte";
import { routes } from "./routes";
import breadcrumbs, { type PageParams } from "./breadcrumbs";
import { inject } from "regexparam";

export const currentRoute = writable<{
  // XXX: in lack of a better type for Svelte components
  component: any;
  params?: Record<string, string>;
}>({ component: ChooseWorld });

export let router = navaid("/", () =>
  currentRoute.set({ component: NotFound }),
);
router.on(routes.ChooseWorld, () =>
  currentRoute.set({ component: ChooseWorld }),
);
router.on(routes.CreateWorld, () =>
  currentRoute.set({ component: CreateWorld }),
);
router.on(routes.ShareWorld, (params) =>
  currentRoute.set({ component: ShareWorld, params }),
);
router.on(routes.JoinWorld, (params) =>
  currentRoute.set({ component: JoinWorld, params }),
);
router.on(routes.Page, (params) => {
  currentRoute.set({ component: Page, params });
  breadcrumbs.newCrumb(params as PageParams);
});

async function setRouteToLastPage() {
  if (location.pathname === "/") {
    const lastWorldBreadcrumbs = await breadcrumbs.lastWorldBreadcrumbs();
    if (lastWorldBreadcrumbs) {
      const { worldId, breadcrumbs } = lastWorldBreadcrumbs;
      for (const crumb of breadcrumbs) {
        router.route(inject(routes.Page, { worldId, pageId: crumb }));
      }
    }
  }
}
export const setRouteToLastPagePromise = setRouteToLastPage();

router.listen();
