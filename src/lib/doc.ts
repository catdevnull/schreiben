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

const credsReq = fetch(
  "https://nulo.metered.live/api/v1/turn/credentials?apiKey=205de2914a8564e2efa19a7d7f299a95e574",
).then((res) => res.json());

export function getWorldY(world: WorldIdentifier): WorldY {
  if (worldYCache[world.room]) return worldYCache[world.room];
  const ydoc = new Y.Doc();
  const provider = new WebrtcProvider(world.room, ydoc, {
    password: world.password,
    signaling: [
      "wss://webrtc-signaling.schreiben.nulo.ar",
      "wss://y-webrtc-eu.fly.dev",
      // "wss://signaling.yjs.dev",
      // "wss://y-webrtc-signaling-eu.herokuapp.com",
      // "wss://y-webrtc-signaling-us.herokuapp.com",
    ],
  });
  credsReq.then((iceServers) => {
    // change the default for future connections
    provider.peerOpts.config = { iceServers };
    if (!provider.room?.webrtcConns) return;
    // change the configuration in current connections
    for (const conn of provider.room?.webrtcConns?.values()) {
      const pc: RTCPeerConnection = conn.peer._pc;
      pc.setConfiguration({
        iceServers,
      });
    }
  });
  const idbProvider = new IndexeddbPersistence(world.room, ydoc);
  const worldY = { ydoc, webrtcProvider: provider };
  worldYCache[world.room] = worldY;
  return worldY;
}

export function getWorldPage(ydoc: Y.Doc, pageId: string): Y.XmlFragment {
  return ydoc.getXmlFragment(`page/${pageId}`);
}
