import { readable, type Readable } from "svelte/store";
import {
  computePosition,
  autoUpdate,
  autoPlacement,
  shift,
  offset,
} from "@floating-ui/dom";
import type { ComputePositionConfig } from "@floating-ui/dom/src/types";
import type { MarkMatch } from "../ps-utils";
import type { EditorView } from "prosemirror-view";

export type Style = string;

export function floatingUi(
  refEl: Element,
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

export function markSelectionFloatingUi(
  view: EditorView,
  mark: MarkMatch,
  tooltipEl: HTMLElement,
  options?: Partial<ComputePositionConfig>,
): Readable<Style> {
  let { node } = (view as any).docView.domFromPos(view.state.selection.from);
  if (!node || !mark || !tooltipEl) return readable("");
  if (!(node instanceof Element)) node = node.parentElement;
  return floatingUi(node, tooltipEl, options);
}
