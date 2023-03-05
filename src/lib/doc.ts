import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";
import { nanoid } from "nanoid";

export type WorldIdentifier = {
  room: string;
  password: string;
};

export type WorldY = {
  ydoc: Y.Doc;
  webrtcProvider: WebrtcProvider;
};

export function generateNewWorld(): WorldIdentifier {
  return {
    room: nanoid(),
    password: nanoid(),
  };
}

// when creating a webrtc provider for a second time in the same room, it freaks out.
// cache the previous doc and return that instead
let worldYCache: { [key: string]: WorldY } = {};

export function getWorldY(world: WorldIdentifier): WorldY {
  if (worldYCache[world.room]) return worldYCache[world.room];
  const ydoc = new Y.Doc();
  const provider = new WebrtcProvider(world.room, ydoc, {
    password: world.password,
    signaling: [
      "wss://signaling.yjs.dev",
      "wss://y-webrtc-signaling-eu.herokuapp.com",
      "wss://y-webrtc-signaling-us.herokuapp.com",
    ],
  });
  const idbProvider = new IndexeddbPersistence(world.room, ydoc);
  const worldY = { ydoc, webrtcProvider: provider };
  worldYCache[world.room] = worldY;
  return worldY;
}

export function getWorldPage(ydoc: Y.Doc, pageId: string): Y.XmlFragment {
  return ydoc.getXmlFragment(`page/${pageId}`);
}
