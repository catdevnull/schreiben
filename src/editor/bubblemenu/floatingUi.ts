import { readable, type Readable } from "svelte/store";
import { computePosition, autoUpdate } from "@floating-ui/dom";
import type {
  ComputePositionConfig,
  ReferenceElement,
} from "@floating-ui/dom/src/types";
import type { EditorView } from "prosemirror-view";
import { getFirstMarkInSelection } from "../ps-utils";

export type Style = string;

export function floatingUi(
  refEl: ReferenceElement,
  tooltipEl: HTMLElement,
  options?: Partial<ComputePositionConfig>,
): Readable<Style> {
  return {
    subscribe(run, invalidate) {
      return autoUpdate(refEl, tooltipEl, () => {
        computePosition(refEl, tooltipEl, options).then(({ x, y }) => {
          run(`left: ${x}px; top: ${y}px`);
        });
      });
    },
  };
}

export function selectionFloatingUi(
  tooltipEl: HTMLElement,
  options?: Partial<ComputePositionConfig>,
): Readable<Style> {
  const sel = document.getSelection();
  const range = sel?.getRangeAt(0);

  if (!range) return readable("");
  return floatingUi(range, tooltipEl, options);
}

export function linkFloatingUi(
  view: EditorView,
  tooltipEl: HTMLElement,
  options?: Partial<ComputePositionConfig>,
): Readable<Style> {
  const mark = getFirstMarkInSelection(
    view.state,
    view.state.schema.marks.link,
  );
  if (!mark) return readable("");
  let node = view.nodeDOM(mark?.position);
  if (!node) return readable("");
  const element = node instanceof Element ? node : node.parentElement;
  if (!element) return readable("");
  return floatingUi(element, tooltipEl, options);
}
