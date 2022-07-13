import m from "mithril";
import { App } from "./App";

declare global {
  interface Window {
    localSettings: LocalSettings;
    getConfig(): LocalSettings;
    writeConfigFile(fileContent: string): Promise<boolean>;
  }
}

interface LocalSettings {
  shop: string;
  shops: string[];
  venditore: string;
  venditori: string[];
  regioni: string[];
}

const mountNode: Element = document.querySelector("#app")!;
if (mountNode) m.mount(mountNode, App);
