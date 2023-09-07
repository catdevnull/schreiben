<script lang="ts">
  import { onMount, tick } from "svelte";
  import ChevronRight from "eva-icons/fill/svg/chevron-right.svg";
  import ArrowDown from "eva-icons/fill/svg/arrow-down.svg";
  import { inject } from "regexparam";
  import breadcrumbs from "../../lib/breadcrumbs";
  import { pageStore } from "../../lib/makeYdocStore";
  import { derived } from "svelte/store";
  import { getTitle } from "../../lib/getTitle";
  import { routes } from "../../lib/routes";
  import Modal from "../../components/Modal.svelte";

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
  $: currentTitle = $crumbsTitles[$crumbsTitles.length - 1];

  let breadcrumbsEl: HTMLDivElement;
  let breadcrumbsListEl: HTMLOListElement;
  const crumbsScrollToEnd = async (behavior: ScrollBehavior = "auto") => {
    await tick();
    breadcrumbsEl.scroll({
      left: breadcrumbsEl.scrollWidth,
      behavior,
    });
  };
  onMount(() => {
    crumbsScrollToEnd("smooth");
    const resizeObserver = new ResizeObserver(() =>
      crumbsScrollToEnd("smooth"),
    );
    resizeObserver.observe(breadcrumbsListEl);
    return () => resizeObserver.disconnect();
  });
  onMount(() => {
    const resizeObserver = new ResizeObserver(() => crumbsScrollToEnd());
    resizeObserver.observe(breadcrumbsEl);
    return () => resizeObserver.disconnect();
  });

  let breadcrumbsModalOpen = false;
</script>

<button
  class="flex items-center overflow-hidden text-lg sm:hidden"
  on:click={() => (breadcrumbsModalOpen = true)}
>
  <span class="overflow-hidden text-ellipsis whitespace-nowrap"
    >{currentTitle}</span
  >
  <ArrowDown class="h-6 w-6 flex-shrink-0 fill-current" /></button
>

{#if breadcrumbsModalOpen}
  <Modal onClose={() => (breadcrumbsModalOpen = false)}>
    <ol class="h-full w-full">
      {#each $pageBreadcrumbs as crumb, index}
        <li
          class="flex items-center overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {#if index !== 0}
            <span aria-hidden="true" class="text-lg">↪</span>
          {/if}
          <a
            href={inject(routes.Page, { worldId, pageId: crumb })}
            on:click={() => ((breadcrumbsModalOpen = false), true)}
            class="overflow-hidden text-ellipsis whitespace-nowrap py-2 pl-4 text-lg"
            class:active-breadcrumb={crumb === pageId}
            >{$crumbsTitles[index] || crumb}</a
          >
        </li>
      {/each}
    </ol>
  </Modal>
{/if}

<!-- https://devdojo.com/pines/docs/breadcrumbs -->
<div
  class="hidden justify-between overflow-x-hidden leading-none sm:flex"
  bind:this={breadcrumbsEl}
>
  <ol
    class="mb-0 inline-flex items-center space-x-1 text-ellipsis text-sm text-neutral-500 dark:text-neutral-300 [&_.active-breadcrumb]:font-medium [&_.active-breadcrumb]:text-neutral-600 dark:[&_.active-breadcrumb]:text-neutral-200"
    bind:this={breadcrumbsListEl}
  >
    {#each $pageBreadcrumbs as crumb, index}
      <li>
        <a
          href={inject(routes.Page, { worldId, pageId: crumb })}
          class="inline-flex items-center text-ellipsis whitespace-nowrap py-1 font-normal focus:outline-none"
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
