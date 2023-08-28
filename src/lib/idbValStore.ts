import { get, set } from "idb-keyval";

export default class IdbValStore<T> {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  get(): Promise<T | undefined> {
    return get<T>(this.name);
  }
  set(val: T): Promise<void> {
    return set(this.name, val);
  }
}
