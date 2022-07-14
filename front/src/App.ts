import m, { Vnode } from "mithril";
// import { cl } from './utils.js'
import { Card, Icon, Icons, TabItem, Tabs } from "construct-ui";
import "./App.css";
import "../node_modules/construct-ui/lib/index.css";
import { tw } from "twind";
import { cl } from "./utils";
import {
  CercaCliente,
  // CercaCliente,
  InserisciArticoli,
  InserisciCliente,
} from "./comps/index";
import { Toasts } from "./comps/AppToaster";
import { Impostazioni } from "./comps/Impostazioni";
// import { Storico } from "./comps/Storico";

export interface ClientInterface {
  header?: string;
  INDIRIZZO: string;
  PIVA: string;
  CF: string;
  CODUNIVOCO: string;
  PEC?: string;
  EMAIL?: string;
  CONTATTO?: string;
  PAGAMENTO: string;
  TEL?: string;
  LISTINO: string;
  TRASPORTA: string;
  START: string;
  TIPO?: "TESTER";
}

export interface StoreInterface {
  clients: ClientInterface[];
  inputs: ClientInterface;
  selectedClient: ClientInterface;
  newClient: boolean;
  activeTab: number;
  iva: 1.22 | 1.04;
  localSettings: Window["localSettings"];
}

export interface TabsProps {
  active: boolean;
  store: StoreInterface;
}

const inputFields: ClientInterface = {
  header: "",
  INDIRIZZO: "",
  PIVA: "",
  CODUNIVOCO: "",
  PEC: "",
  CF: "",
  EMAIL: "",
  CONTATTO: "",
  TEL: "",
  LISTINO: "",
  TRASPORTA: "",
  PAGAMENTO: "",
  START: "",
};

const Store: StoreInterface = {
  clients: [],
  inputs: inputFields,
  selectedClient: undefined,
  newClient: false,
  activeTab: 0,
  iva: 1.22,
  localSettings: window.localSettings,
};

const tabs = [
  {
    tabView: CercaCliente,
    label: [m(Icon, { name: Icons.SEARCH }), ""],
  },
  {
    tabView: InserisciCliente,
    label: [m(Icon, { name: Icons.USER }), ""],
  },
  {
    tabView: InserisciArticoli,
    label: [m(Icon, { name: Icons.DOLLAR_SIGN }), ""],
  },
  {
    tabView: Impostazioni,
    label: [m(Icon, { name: Icons.SETTINGS }), ""],
  },
];

export const App = (v: Vnode<{}, { active: number }>) => {
  return {
    async oninit() {
      console.log("init of App");
      const configContent = await window.fetchConfigFileContent();
      Store.localSettings = JSON.parse(configContent);
      if (!Store.localSettings) {
        console.log("setting from window");
        Store.localSettings = window.localSettings;
      }
    },
    onupdate() {
      console.log(Store.localSettings);
    },
    view() {
      return m(
        ".app_root",
        {
          class: tw`p-4`,
        },
        m(
          Card,
          {
            elevation: 2,
            size: "lg",
            fluid: true,
          },
          m(Tabs, {
            fluid: true,
            size: "sm",
            class: tw`mb-4 grid grid-cols-4`,
          }, [
            tabs.map((tab, i) => {
              return m(TabItem, {
                key: i,
                label: tab.label,
                class: tw`justify-center`,
                active: Store.activeTab == i,
                onclick: () => {
                  selTab(i, Store);
                },
              });
            }),
          ]),
          m(
            ".flex",
            {
              class: tw`overflow-hidden`,
            },
            tabs.map((tab, i) => {
              return m(tabs[i].tabView, {
                active: Store.activeTab === i,
                store: Store,
              });
            }),
          ),
          m(Toasts, {
            clearOnEscapeKey: false,
            position: "top",
          }),
        ),
      );
    },
  };
};

export function selTab(n: number, st: StoreInterface) {
  st.activeTab = n;
  const tabs = cl(".tab");
  if (tabs) {
    cl(tabs, "remove", "active");
    cl(tabs[n], "add", "active");
  }
}
