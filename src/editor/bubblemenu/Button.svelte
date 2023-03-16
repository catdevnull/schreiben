<script lang="ts">
  export let active: boolean = false;
  export let onClick: (event: Event) => void;
  export let title: string = "";
</script>

<button
  type="button"
  {title}
  class:active
  on:mousedown|preventDefault={onClick}
>
  <slot />
</button>

<style>
  button {
    appearance: none;
    background: none;
    color: inherit;
    border: none;
    border-radius: 2px;
    padding: 0.3em;
    margin: 0.2em;
    width: 2rem;
    height: 2rem;
    font-size: 1em;
    line-height: 1;

    transition: background 0.2s;
  }
  /* https://stackoverflow.com/a/64553121 */
  @media (hover: hover) and (pointer: fine) {
    button:hover {
      background: #eee;
    }
  }
  button.active {
    background: #ddd;
  }
</style>
