declare global {
  interface Window {
    localSettings: LocalSettings;
    getConfig(): LocalSettings;
    updateConfigFile(): Promise<boolean>;
  }
}

interface LocalSettings {
  shop: string;
  shops: string[];
  venditore: string;
  venditori: string[];
}

export { PIvaInput } from "./PIvaInput";
export { CercaCliente } from "./CercaCliente";
export { InserisciCliente } from "./InserisciCliente";
export { InserisciArticoli } from "./InserisciArticoli";
