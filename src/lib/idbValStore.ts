import { get, set, update } from "idb-keyval";

export default class IdbValStore<T> {
  name: string;
  subscriptors: ((val: T) => void)[];
  constructor(name: string) {
    this.name = name;
    this.subscriptors = [];
  }
  get(): Promise<T | undefined> {
    return get<T>(this.name);
  }
  async set(val: T): Promise<void> {
    await set(this.name, val);
    this.push(val);
  }
  async update(updater: (val: T | undefined) => T): Promise<void> {
    let newVal: T | undefined = undefined;
    await update(this.name, (val) => (newVal = updater(val)));
    if (newVal === undefined) throw new Error("what the fuck");
    this.push(newVal);
  }

  private push(val: T) {
    for (const sub of this.subscriptors) sub(val);
  }
  subscribe(subscription: (value: T | undefined) => void): () => void {
    this.subscriptors.push(subscription);
    (async () => {
      const val = await this.get();
      if (this.subscriptors.includes(subscription)) subscription(val);
    })();
    return () => {
      this.subscriptors = this.subscriptors.filter((s) => s !== subscription);
    };
  }
}
