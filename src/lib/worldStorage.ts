import type { WorldIdentifier } from "./doc";

const localStorageKey = "schreiben-worlds";

export function loadWorlds(): Promise<WorldIdentifier[]> {
  let json = localStorage.getItem(localStorageKey);
  if (!json) json = "[]";
  return Promise.resolve(JSON.parse(json));
}

export async function writeWorlds(
  callback: (worlds: WorldIdentifier[]) => WorldIdentifier[]
): Promise<WorldIdentifier[]> {
  const oldWorlds = await loadWorlds();
  const newWorlds = callback(oldWorlds);
  localStorage.setItem(localStorageKey, JSON.stringify(newWorlds));
  return newWorlds;
}
