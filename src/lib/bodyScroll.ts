import type { Readable } from "svelte/store";

// weird way to stop scroll in the body
// when the store is mounted, scroll stops in the body
class BodyScroll implements Readable<boolean> {
  num: number = 0;

  refresh() {
    if (this.num > 0) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }

  subscribe() {
    this.num++;
    this.refresh();
    return () => {
      this.num--;
      this.refresh();
    };
  }
}

const bodyScroll = new BodyScroll();
export default bodyScroll;
