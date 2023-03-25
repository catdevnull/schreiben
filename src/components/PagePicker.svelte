<script lang="ts">
  import type { Readable } from "svelte/store";
  import { yDocToProsemirrorJSON } from "y-prosemirror";
  import { Node } from "prosemirror-model";
  import type { Doc } from "yjs";
  import { schema } from "../editor/schema";
  import { makeYdocStore } from "../lib/makeYdocStore";
  import { lastUpdated } from "../lib/lastUpdated";

  type Entry = {
    id: string;
    name: string;
    title?: string;
  };

  function getDocs(ydoc: Doc): Entry[] {
    let docs: Entry[] = [];
    for (const name of ydoc.share.keys()) {
      if (name.startsWith("page/")) {
        const json = yDocToProsemirrorJSON(ydoc, name);
        const node = Node.fromJSON(schema, json);
        let titleNode: null | Node = null;
        node.descendants((node) => {
          if (titleNode) return false;
          if (node.type.name === "heading" && node.attrs.level === 1) {
            titleNode = node;
            return false;
          }
        });
        docs.push({
          title: titleNode?.textContent,
          id: name.replace(/^page\//, ""),
          name,
        });
      }
    }
    return docs;
  }

  let filter: string = "";

  export let onChoose: (id: string) => void;
  export let ydoc: Doc;
  $: entries = deriveEntries(ydoc);
  $: lastU = lastUpdated(ydoc);
  $: sortedEntries = $entries
    .sort((a, b) => +$lastU.get(b.name) - +$lastU.get(a.name))
    // TODO: FTS
    .filter((x) => (x.title ?? x.id).includes(filter));
  // $: console.debug($lastU);

  const deriveEntries = makeYdocStore((_, __, ydoc) => getDocs(ydoc));
</script>

<input type="text" bind:value={filter} placeholder="Buscar..." autofocus />
<ul>
  {#each sortedEntries as entry}
    <li>
      <button type="button" on:click={() => onChoose(entry.id)}
        >{entry.title ?? entry.id}</button
      >
    </li>
  {/each}
</ul>
