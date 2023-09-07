<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  /* https://wicg.github.io/visual-viewport/examples/fixed-to-keyboard.html */
  let barStyle = "";
  function updateBar() {
    const viewport = window.visualViewport!;
    // Since the bar is position: fixed we need to offset it by the
    // visual viewport's offset from the layout viewport origin.
    const offsetY = window.innerHeight - viewport.height - viewport.offsetTop;

    barStyle = `
left: ${viewport.offsetLeft}px;
bottom: ${offsetY}px;
transform: scale(${1 / viewport.scale});
`;
  }

  onMount(() => {
    window.visualViewport!.addEventListener("resize", updateBar);
    window.visualViewport!.addEventListener("scroll", updateBar);
  });
  onDestroy(() => {
    window.visualViewport!.removeEventListener("resize", updateBar);
    window.visualViewport!.removeEventListener("scroll", updateBar);
  });
</script>

<div
  class="transform-origin- fixed bottom-0 left-0 z-40 flex w-full flex-col"
  style={barStyle}
>
  <slot />
</div>

<style>
  /* https://wicg.github.io/visual-viewport/examples/fixed-to-keyboard.html */
  .transform-origin- {
    transform-origin: left bottom;
  }
</style>
