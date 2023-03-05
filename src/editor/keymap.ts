// derivado de prosemirror-commands/src/commands.js

import {
  chainCommands,
  createParagraphNear,
  deleteSelection,
  exitCode,
  joinBackward,
  joinForward,
  liftEmptyBlock,
  newlineInCode,
  selectAll,
  selectNodeBackward,
  selectNodeForward,
  splitBlock,
} from "prosemirror-commands";
import { undo, redo } from "y-prosemirror";
import {
  splitListItem,
  liftListItem,
  sinkListItem,
} from "prosemirror-schema-list";

import { schema } from "./schema";

const backspace = chainCommands(
  deleteSelection,
  joinBackward,
  selectNodeBackward
);
const del = chainCommands(deleteSelection, joinForward, selectNodeForward);

const pcBaseKeymap = {
  Enter: chainCommands(
    newlineInCode,
    createParagraphNear,
    liftEmptyBlock,
    // XXX: hack
    splitListItem(schema.nodes.list_item as any),
    splitBlock
  ),
  "Mod-Enter": chainCommands(exitCode, splitBlock),
  Backspace: backspace,
  "Mod-Backspace": backspace,
  Delete: del,
  "Mod-Delete": del,
  "Mod-a": selectAll,
  "Shift-Tab": liftListItem(schema.nodes.list_item),
  Tab: sinkListItem(schema.nodes.list_item),
};

const macBaseKeymap = {
  ...pcBaseKeymap,
  "Ctrl-h": pcBaseKeymap["Backspace"],
  "Alt-Backspace": pcBaseKeymap["Mod-Backspace"],
  "Ctrl-d": pcBaseKeymap["Delete"],
  "Ctrl-Alt-Backspace": pcBaseKeymap["Mod-Delete"],
  "Alt-Delete": pcBaseKeymap["Mod-Delete"],
  "Alt-d": pcBaseKeymap["Mod-Delete"],
};

const mac =
  typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false;

export const baseKeymap = {
  ...(mac ? macBaseKeymap : pcBaseKeymap),
  "Mod-z": undo,
  "Mod-y": redo,
};
