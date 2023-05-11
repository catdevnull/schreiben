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

<div class="linking">
  <div class="links">
    {#each links as link}
      <a
        href={"href" in link ? link.href : link.id}
        target={link.type === "external" ? "_blank" : null}
      >
        {#if link.type === "internal"}
          <InternalLinkIcon />
        {:else}
          <LinkIcon />
        {/if}
        {link.content}
      </a>
    {/each}
  </div>
</div>

<style>
  .linking {
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    overflow-x: auto;
  }
  .links {
    display: flex;
    min-width: min-content;
  }

  a {
    background: ButtonFace;
    color: ButtonText;
    padding: 0.7em 1em;
    margin: 0.3em;
    display: flex;
    gap: 0.25em;
    align-items: center;
    border-radius: 2em;
    text-decoration: none;
    line-height: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 45vw;
    white-space: nowrap;
  }

  .linking :global(svg) {
    fill: currentColor;
    width: 1.25em;
    height: 1.25em;
  }
</style>
