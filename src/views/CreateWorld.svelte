<script lang="ts">
  import { generateNewWorld } from "../lib/doc";
  import { router, routes } from "../lib/routes";
  import { writeWorlds } from "../lib/worldStorage";

  function crear(
    event: Event & { readonly submitter: HTMLElement } & {
      currentTarget: EventTarget & HTMLFormElement;
    }
  ) {
    event.preventDefault();
    writeWorlds((worlds) => [...worlds, generateNewWorld()]);
    router.run(routes.ChooseWorld);
  }
</script>

<form on:submit={crear}>
  <button>Crear mundo</button>
</form>
