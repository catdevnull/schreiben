<script lang="ts">
  import { onMount, tick } from "svelte";
  import ChevronRight from "eva-icons/fill/svg/chevron-right.svg";
  import { inject } from "regexparam";
  import breadcrumbs from "../../lib/breadcrumbs";
  import { pageStore } from "../../lib/makeYdocStore";
  import { derived } from "svelte/store";
  import { getTitle } from "../../lib/getTitle";
  import { routes } from "../../lib/routes";

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

<!-- https://devdojo.com/pines/docs/breadcrumbs -->
<div
  class="flex justify-between overflow-x-auto rounded-md border border-neutral-200/60 px-3.5 py-1 dark:border-neutral-700"
  bind:this={breadcrumbsEl}
>
  <ol
    class="inline-flex items-center space-x-1 text-xs text-neutral-500 dark:text-neutral-300 sm:mb-0 [&_.active-breadcrumb]:font-medium [&_.active-breadcrumb]:text-neutral-600 dark:[&_.active-breadcrumb]:text-neutral-200"
  >
    {#each $pageBreadcrumbs as crumb, index}
      <li>
        <a
          href={inject(routes.Page, { worldId, pageId: crumb })}
          class="font-norma inline-flex items-center text-ellipsis whitespace-nowrap py-1 focus:outline-none"
          class:active-breadcrumb={crumb === pageId}
          >{$crumbsTitles[index] || crumb}</a
        >
      </li>
      {#if index !== $pageBreadcrumbs.length - 1}
        <ChevronRight
          class="h-5 w-5 fill-current text-gray-400/70 dark:text-gray-500"
        />
      {/if}
    {/each}
  </ol>
</div>
