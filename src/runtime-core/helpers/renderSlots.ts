import { Fragment } from "./../vnode";
import { createVnode } from "../vnode";

export function renderSlots(slots, type, props) {
  let slot = slots[type];
  if (slot && typeof slot === "function") {
    return createVnode(Fragment, {}, slot(props));
  }
}
