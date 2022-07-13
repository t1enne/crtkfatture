import m, { Vnode } from "mithril";
// import { cl } from './utils.js'
import { Card, Icon, Icons, TabItem, Tabs } from "construct-ui";
import "./App.css";
import "../node_modules/construct-ui/lib/index.css";
import { tw } from "twind";
import { cl } from "./utils";
import {
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
  newClient: ClientInterface;
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
  newClient: undefined,
  activeTab: 0,
  iva: 1.22,
  localSettings: window.localSettings,
};

export const App = (v: Vnode<{}, { active: number, tabs: any[] }>) => {
  return {
    tabs: [],
    async oninit() {
      const configContent = await window.fetchConfigFileContent();
      Store.localSettings = JSON.parse(configContent);
      console.log('init of App');

      v.state.tabs = [
        {
          tabView: m(InserisciCliente, {
            active: Store.activeTab === 0,
            store: Store,
          }),
          label: [m(Icon, { name: Icons.USER }), ""],
        },
        {
          tabView: m(InserisciArticoli, {
            active: Store.activeTab === 1,
            store: Store,
          }),
          label: [m(Icon, { name: Icons.DOLLAR_SIGN }), ""],
        },
        // { label: [m(Icon, { name: Icons.ARCHIVE }), m(``, '')] },
        {
          tabView: m(Impostazioni, { active: Store.activeTab === 2, store: Store }),
          label: [m(Icon, { name: Icons.SETTINGS }), m(``, "")],
        },
      ];
      m.redraw()
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
            class: tw`mb-4 grid grid-cols-3`,
          }, [
            v.state.tabs.map((tab, i) => {
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
            v.state.tabs.map((tab, i) => {
              return tab.tabView;
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
