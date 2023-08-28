<script>
  import { inject } from "regexparam";
  import { getWorldY } from "../lib/doc";
  import { titleStore } from "../lib/titleStore";
  import { routes } from "../lib/routes";

  /** @type {import("../lib/doc").WorldIdentifier} */
  export let world;
  /** @type {string} */
  export let className = "";

  $: title = titleStore(getWorldY(world).ydoc, "page/index");
</script>

<a
  class={className}
  href={inject(routes.Page, {
    worldId: world.room,
    pageId: "index",
  })}>{$title || world.room}</a
>
