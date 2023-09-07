<script>
  // Inspirado en https://collectednotes.com/blog/zettelkasten

  import { schema } from "../schema";
  import LinkIcon from "eva-icons/outline/svg/external-link-outline.svg";
  import InternalLinkIcon from "eva-icons/outline/svg/menu-arrow-outline.svg";

  // /** @type {import("prosemirror-view").EditorView} */
  // export let view;
  /** @type {import("prosemirror-state").EditorState} */
  export let state;

  /** @typedef {object} ExternalLink
   * @prop {'external'} type
   * @prop {string} content
   * @prop {string} href
   */
  /** @typedef {object} InternalLink
   * @prop {'internal'} type
   * @prop {string} content
   * @prop {string} id
   */
  /** @typedef {ExternalLink | InternalLink} Link */

  /**
   * @param {import("prosemirror-model").Node} node
   * @returns {Link[]}
   */
  function getLinks(node) {
    /** @type {Link[]} */
    let links = [];

    // a veces selecciona el documento entero y no queremos mostrar todos los enlaces
    if (node.type.spec.group !== "block") return [];

    let lastWasLinkMark = false;
    node.descendants((node) => {
      for (const mark of node.marks) {
        const content = node.textContent;
        // no repetir marks interrumpidas por otras marks
        const lastLink = links[links.length - 1] || null;
        if (
          lastWasLinkMark &&
          lastLink &&
          ("href" in lastLink
            ? lastLink.href === mark.attrs.href
            : lastLink.id === mark.attrs.id)
        ) {
          lastLink.content += node.textContent;
          continue;
        }
        if (mark.type === schema.marks.link) {
          links.push({
            type: "external",
            content,
            href: mark.attrs.href,
          });
          lastWasLinkMark = true;
        } else if (mark.type === schema.marks.internal_link) {
          links.push({
            type: "internal",
            content,
            id: mark.attrs.id,
          });
          lastWasLinkMark = true;
        } else {
          lastWasLinkMark = false;
        }
      }
      if (node.marks.length == 0) lastWasLinkMark = false;
    });
    return links;
  }

  $: links = getLinks(state.selection.$to.parent);
</script>

<div class="mx-auto w-full max-w-7xl overflow-x-auto">
  <div class="flex min-w-min">
    {#each links as link}
      <a
        class="m-1 flex max-w-[45vw] items-center gap-1 rounded-full border border-neutral-200 bg-white px-4 py-3 no-underline dark:border-neutral-700/70 dark:bg-neutral-800"
        href={"href" in link ? link.href : link.id}
        target={link.type === "external" ? "_blank" : null}
      >
        {#if link.type === "internal"}
          <InternalLinkIcon class="h-5 w-5 shrink-0 fill-current" />
        {:else}
          <LinkIcon class="h-5 w-5 shrink-0 fill-current" />
        {/if}
        <span class="overflow-hidden text-ellipsis whitespace-nowrap"
          >{link.content}</span
        >
      </a>
    {/each}
  </div>
</div>
