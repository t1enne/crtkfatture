import m from "mithril";
import { App, ClientInterface } from "./App";

declare global {
  interface Window {
    localSettings: LocalSettings;
    fetchConfigFileContent(): Promise<string>;
    writeConfigFile(fileContent: string): Promise<boolean>;
    sendMail(subject: string, mailBody: string);
    writeToClientsFile(json: ClientInterface): Promise<boolean>;
    findClients(query: string): ClientInterface[];
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
