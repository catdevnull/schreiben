<script lang="ts">
  import { generateNewWorld } from "../lib/doc";
  import { routes } from "../lib/routes";
  import { router } from "../lib/router";
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
