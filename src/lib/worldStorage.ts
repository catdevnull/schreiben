import type { Readable, Subscriber } from "svelte/store";
import { getWorldY, type WorldIdentifier } from "./doc";

const localStorageKey = "schreiben-worlds";

let subs: Subscriber<WorldIdentifier[]>[] = [];

export function loadWorlds(): Promise<WorldIdentifier[]> {
  let json = localStorage.getItem(localStorageKey);
  if (!json) json = "[]";
  const worlds = JSON.parse(json);
  for (const world of worlds) {
    // empezar a cargar el Ydoc
    getWorldY(world);
  }
  return Promise.resolve(worlds);
}

export async function writeWorlds(
  callback: (worlds: WorldIdentifier[]) => WorldIdentifier[],
): Promise<WorldIdentifier[]> {
  const oldWorlds = await loadWorlds();
  const newWorlds = callback(oldWorlds);
  localStorage.setItem(localStorageKey, JSON.stringify(newWorlds));
  for (const sub of subs) sub(newWorlds);
  return newWorlds;
}

export const worldsStore: Readable<WorldIdentifier[]> = {
  subscribe(run) {
    subs.push(run);
    loadWorlds().then(run);
    return () => (subs = subs.filter((s) => s !== run));
  },
};
