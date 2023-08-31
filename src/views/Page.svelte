<script lang="ts">
  import type { XmlFragment } from "yjs";
  import { inject } from "regexparam";
  import ChevronRight from "eva-icons/fill/svg/chevron-right.svg";
  import Editor from "../editor/Editor.svelte";
  import { getWorldPage, getWorldY, type WorldY } from "../lib/doc";
  import { routes } from "../lib/routes";
  import { loadWorlds } from "../lib/worldStorage";
  import breadcrumbs from "../lib/breadcrumbs";
  import { pageStore } from "../lib/makeYdocStore";
  import { derived } from "svelte/store";
  import { getTitle } from "../lib/getTitle";
  import { onMount, tick } from "svelte";

  export let worldId: string;
  export let pageId: string;

  $: pageBreadcrumbs = breadcrumbs.worldStore(worldId);
  $: crumbsTitles = derived(
    [pageBreadcrumbs],
    ([crumbs], set: (val: (string | undefined)[]) => void) => {
      return derived(
        crumbs.map((c) => pageStore(worldId, c)),
        (crumbPages) =>
          crumbPages.map(
            (x, index) =>
              x && x.doc && getTitle(x.doc, `page/${crumbs[index]}`),
          ),
      ).subscribe(set);
    },
  );

  async function loadDoc(
    worldId: string,
    pageId: string,
  ): Promise<{ worldY: WorldY; doc: XmlFragment }> {
    const worlds = await loadWorlds();
    const worldIdentifier = worlds.find((w) => w.room === worldId);
    if (!worldIdentifier) {
      throw new Error("No conozco ese mundo.");
    }
    const worldY = getWorldY(worldIdentifier);

    return { worldY, doc: getWorldPage(worldY.ydoc, pageId) };
  }

  let state: "loading" | { worldY: WorldY; doc: XmlFragment } | { error: any };
  $: {
    state = "loading";
    loadDoc(worldId, pageId)
      .then((doc) => {
        state = doc;
      })
      .catch((error) => (state = { error }));
  }

  let breadcrumbsEl: HTMLDivElement;
  const crumbsScrollToEnd = async () => {
    await tick();
    breadcrumbsEl?.scroll({
      left: breadcrumbsEl.scrollWidth,
      behavior: "smooth",
    });
  };

  onMount(() => {
    crumbsScrollToEnd();
  });
  $: {
    $crumbsTitles;
    $pageBreadcrumbs;
    crumbsScrollToEnd();
  }
</script>

<nav>
  <details>
    <summary>Opciones</summary>
    <ul>
      <li><a href={routes.ChooseWorld}>🠔 Elegir otro mundo</a></li>
      <li>
        <a href={inject(routes.ShareWorld, { worldId })}
          >📱 Agregar mundo a otro dispositivo</a
        >
      </li>
    </ul>
  </details>

  <!-- https://devdojo.com/pines/docs/breadcrumbs -->
  <div
    class="flex justify-between overflow-x-auto rounded-md border border-neutral-200/60 px-3.5 py-1"
    bind:this={breadcrumbsEl}
  >
    <ol
      class="inline-flex items-center space-x-1 text-xs text-neutral-500 sm:mb-0 [&_.active-breadcrumb]:font-medium [&_.active-breadcrumb]:text-neutral-600"
    >
      {#each $pageBreadcrumbs as crumb, index}
        <li
          class:anchor-none={index !== $pageBreadcrumbs.length - 1}
          class:anchor-auto={index === $pageBreadcrumbs.length - 1}
        >
          <a
            href={inject(routes.Page, { worldId, pageId: crumb })}
            class="inline-flex items-center text-ellipsis whitespace-nowrap py-1 font-normal hover:text-neutral-900 focus:outline-none"
            class:active-breadcrumb={crumb === pageId}
            >{$crumbsTitles[index] || crumb}</a
          >
        </li>
        {#if index !== $pageBreadcrumbs.length - 1}
          <ChevronRight
            class="anchor-none h-5 w-5 fill-current text-gray-400/70"
          />
        {/if}
      {/each}
    </ol>
  </div>
</nav>

{#if state === "loading"}Cargando...{:else if "doc" in state}
  <Editor doc={state.doc} worldY={state.worldY} />
{:else if "error" in state}
  {state.error}
  <a href={routes.ChooseWorld}>Volver al inicio</a>
{/if}

<style>
  nav a {
    color: inherit;
  }

  .anchor-none {
    overflow-anchor: none;
  }
  .anchor-auto {
    overflow-anchor: auto;
  }
</style>
