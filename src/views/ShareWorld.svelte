<script lang="ts">
  import { inject } from "regexparam";
  import { routes } from "../lib/routes";
  import { loadWorlds } from "../lib/worldStorage";

  export let worldId: string;

  async function joinWorldLink() {
    const worlds = await loadWorlds();
    const worldIdentifier = worlds.find((w) => w.room === worldId);
    if (!worldIdentifier) throw new Error("No tenés ese mundo para compartir.");
    return `${location.origin}${inject(routes.JoinWorld, {
      worldId: worldIdentifier.room,
    })}#${worldIdentifier.password}`;
  }
  async function copyJoinWorldLink() {
    await navigator.clipboard.writeText(await joinWorldLink());
  }
  async function shareJoinWorldLink() {
    const link = await joinWorldLink();
    await navigator.share({ url: link });
  }

  const canShare = "share" in navigator;
</script>

<nav>
  <button on:click={() => history.back()}>🠔 Volver atrás</button>
</nav>
<p>
  Podés añadir a otros dispositivos a este mundo. Se va a sincronizar
  automágicamente.
</p>
<p>
  Nota: Schreiben todavía no está diseñado para ser una herramienta colaborativa
  entre varias personas. Esta opción existe para usar entre varios dispositivos
  de una misma persona. Compartir este enlace da control completo sobre el
  mundo.
</p>
{#if canShare}
  <button on:click={shareJoinWorldLink}>Compartir enlace</button>
{/if}
<button on:click={copyJoinWorldLink}>Copiar enlace</button>
