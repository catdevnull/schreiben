<script lang="ts">
  import { router, routes } from "../lib/routes";
  import { inject } from "regexparam";
  import { writeWorlds } from "../lib/worldStorage";

  export let worldId: string;

  async function addWorld() {
    const password = location.hash.slice(1);
    await writeWorlds((worlds) => [
      // reemplazar mundo en vez de agregar nuevo, por si se agregó antes con la contraseña incorrecta
      ...worlds.filter(({ room }) => room !== worldId),
      { room: worldId, password },
    ]);
    router.route(inject(routes.Page, { worldId, pageId: "index" }));
  }
</script>

<!-- TODO: mostrar título? -->
<h1>Añadir {worldId}</h1>
<button on:click={addWorld}>Añadir mundo</button>
