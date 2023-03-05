import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
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

export function getWorldY(world: WorldIdentifier): WorldY {
  const ydoc = new Y.Doc();
  const provider = new WebrtcProvider(world.room, ydoc, {
    password: world.password,
    signaling: [
      "wss://signaling.yjs.dev",
      "wss://y-webrtc-signaling-eu.herokuapp.com",
      "wss://y-webrtc-signaling-us.herokuapp.com",
    ],
  });
  return { ydoc, webrtcProvider: provider };
}

export function getWorldPage(ydoc: Y.Doc, pageId: string): Y.XmlFragment {
  return ydoc.getXmlFragment(`doc/${pageId}`);
}
