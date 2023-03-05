<script lang="ts">
  import { onDestroy } from "svelte";
  import type { XmlFragment } from "yjs";
  import Editor from "../editor/Editor.svelte";
  import { getWorldPage, getWorldY, type WorldY } from "../lib/doc";
  import { routes } from "../lib/routes";
  import { loadWorlds } from "../lib/worldStorage";

  export let worldId: string;
  export let pageId: string;

  async function loadDoc(
    worldId: string,
    pageId: string
  ): Promise<{ worldY: WorldY; doc: XmlFragment }> {
    const worlds = await loadWorlds();
    const worldIdentifier = worlds.find((w) => w.room === worldId);
    if (!worldIdentifier) {
      throw new Error("No conozco ese mundo.");
    }
    const worldY = getWorldY(worldIdentifier);
    return { worldY, doc: getWorldPage(worldY.ydoc, pageId) };
  }

  $: docPromise = loadDoc(worldId, pageId);

  onDestroy(async () => {
    const doc = await docPromise;
    doc.worldY.webrtcProvider.destroy();
  });
</script>

<a class="no-color" href={routes.ChooseWorld}>🠔 Elegir otro mundo</a>
{#await docPromise then doc}
  <Editor doc={doc.doc} />
{:catch error}
  {error}
  <a href={routes.ChooseWorld}>Volver al inicio</a>
{/await}

<style>
  .no-color {
    color: inherit;
  }
</style>
