import m from "mithril";
import { App } from "./App";

const mountNode: Element = document.querySelector("#app")!;
if (mountNode) m.mount(mountNode, App);

