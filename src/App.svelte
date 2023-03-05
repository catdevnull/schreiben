<script lang="ts">
  import { nanoid } from "nanoid";
  import Editor from "./editor/Editor.svelte";

  import { getWorldPage, getWorldY } from "./lib/doc";
  import { currentRoute } from "./lib/routes";

  let worldDescriptor: string = "";
  let fileId: string = nanoid();
  $: world = worldDescriptor.includes(":")
    ? {
        room: worldDescriptor.split(":")[0],
        password: worldDescriptor.split(":")[1],
      }
    : null;
  $: worldY = world && getWorldY(world);
  $: doc = worldY && getWorldPage(worldY.ydoc, fileId);

  function generateWorld() {
    worldDescriptor = `${nanoid()}:${nanoid()}`;
  }
</script>

<main>
  <svelte:component this={$currentRoute.component} {...$currentRoute.params} />
  <!-- <button on:click={generateWorld}>generar mundo</button>
  <input
    type="text"
    bind:value={worldDescriptor}
    placeholder="mundo descriptor"
  />
  <input type="text" bind:value={fileId} placeholder="world" />

  {#if doc}<Editor {doc} />{/if} -->
</main>

<style>
  main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>
