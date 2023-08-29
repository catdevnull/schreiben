import { getWorldY, type WorldIdentifier } from "./doc";

const localStorageKey = "schreiben-worlds";

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
  return newWorlds;
}
