<script lang="ts">
  import { yDocToProsemirrorJSON } from "y-prosemirror";
  import { Node } from "prosemirror-model";
  import type { Doc } from "yjs";
  import { schema } from "../editor/schema";
  import { makeYdocStore } from "../lib/makeYdocStore";
  import { lastUpdated } from "../lib/lastUpdated";
  import { nanoid } from "nanoid";
  import PlusIcon from "eva-icons/fill/svg/plus.svg";

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
          title: titleNode ? (titleNode as Node).textContent : undefined,
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
    .sort((a, b) => +($lastU.get(b.name) || 0) - +($lastU.get(a.name) || 0))
    // TODO: FTS
    .filter((x) => (x.title ?? x.id).includes(filter));
  // $: console.debug($lastU);

  const deriveEntries = makeYdocStore((_, __, ydoc) => getDocs(ydoc));
</script>

<!-- https://devdojo.com/pines/docs/text-input -->
<input
  type="text"
  bind:value={filter}
  placeholder="Buscar..."
  autofocus
  class="h-10 w-full rounded-md rounded-b-none border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 dark:border-neutral-600 dark:bg-neutral-700 placeholder:dark:text-neutral-300"
/>
<ul
  class="flex flex-col rounded-b-md border border-t-0 border-neutral-300 bg-white p-2 dark:border-neutral-600 dark:bg-neutral-700"
>
  <button
    type="button"
    class="flex items-center gap-2 rounded px-2 py-2 text-left hover:bg-neutral-200 dark:hover:bg-neutral-600"
    on:click={() => onChoose(nanoid())}
  >
    <PlusIcon class="w-6 fill-current" />
    Página nueva
  </button>
  {#each sortedEntries as entry, index (entry.id)}
    <li>
      <button
        type="button"
        class="flex w-full items-center gap-2 rounded px-2 py-2 text-left hover:bg-neutral-200 dark:hover:bg-neutral-600"
        on:click={() => onChoose(entry.id)}>{entry.title ?? entry.id}</button
      >
    </li>
  {/each}
</ul>
