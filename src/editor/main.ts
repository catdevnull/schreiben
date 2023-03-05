import "./demo.css";
import Editor from "./Editor.svelte";

const editor = new Editor({
  target: document.body,
  props: {
    textareaEl: document.body.querySelector("textarea"),
  },
});

export default editor;
