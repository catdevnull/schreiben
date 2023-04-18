<script>
  // Inspirado en https://collectednotes.com/blog/zettelkasten

  import { schema } from "../schema";
  import LinkIcon from "bootstrap-icons/icons/box-arrow-up-right.svg";
  import InternalLinkIcon from "bootstrap-icons/icons/folder-symlink.svg";

  const svgStyle = "width: 1em; height: 1em";

  /** @type {import("prosemirror-view").EditorView} */
  export let view;
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
  {#each links as link}
    <a
      href={"href" in link ? link.href : link.id}
      target={link.type === "external" ? "_blank" : null}
    >
      {#if link.type === "internal"}
        <InternalLinkIcon style={svgStyle} />
      {:else}
        <LinkIcon style={svgStyle} />
      {/if}
      {link.content}
    </a>
  {/each}
</div>

<style>
  .linking {
    max-width: 1280px;
    width: 100%;
    margin: 0 auto;
    display: flex;
  }

  a {
    background: ButtonFace;
    color: ButtonText;
    padding: 0.7em 1em;
    margin: 0.3em;
    border-radius: 2em;
    display: block;
    text-decoration: none;
    line-height: 1;
    text-overflow: ellipsis;
    overflow: hidden;
    max-width: 40vw;
    white-space: nowrap;
  }
</style>
