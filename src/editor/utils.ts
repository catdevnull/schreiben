interface Props {
  dataset?: { [key: string]: string };
  attributes?: { [key: string]: string };
  contenteditable?: "true" | "false";
  class?: string;
  on?: { [key: string]: EventListener };
}

export function h(
  tagName: string,
  props: Props,
  children: (Node | string | undefined)[]
): HTMLElement {
  const el = document.createElement(tagName);
  if (props.class) {
    el.setAttribute("class", props.class);
  }
  if (props.dataset) {
    for (const [key, value] of Object.entries(props.dataset)) {
      el.dataset[key] = value;
    }
  }
  if (props.contenteditable) {
    el.contentEditable = props.contenteditable;
  }
  if (props.attributes) {
    for (const [key, value] of Object.entries(props.attributes)) {
      el.setAttribute(key, value);
    }
  }
  if (props.on) {
    for (const [key, value] of Object.entries(props.on)) {
      el.addEventListener(key, value);
    }
  }
  for (const node of children) {
    if (typeof node === "string") {
      el.appendChild(document.createTextNode(node));
    } else if (node) {
      el.appendChild(node);
    }
  }
  return el;
}

export enum ListKind {
  Unordered,
  Ordered,
}
