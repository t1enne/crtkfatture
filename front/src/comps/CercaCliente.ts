import m, { Vnode } from "mithril";
import { tw } from "twind";
import {
  ControlGroup,
  Icon,
  Icons,
  Input,
  List,
  ListItem,
} from "construct-ui";
import { ClientInterface, selTab, TabsProps } from "../App";

export const CercaCliente = (v: Vnode<TabsProps, {}>) => {
  let clients = [];
  let searchQuery = "";
  return {
    async oninit() {
      // if (localStorage.dataPath && localStorage.dataPath != '') {
      // @ts-ignore
      v.attrs.store.clients = await fetchClients()
      clients = v.attrs.store.clients
      console.log({ clients: v.attrs.store.clients })
      // }
    },
    async onupdate() {
      if (localStorage.dataPath && clients?.length == 0) await sendReadEvent();
    },
    view() {
      return m(`.tab`, {
        class: v.attrs.active ? "active" : "",
      }, [
        m("h1", { class: tw`text-xl font-bold mb-4` }, "Cerca Cliente"),
        m(
          ControlGroup, {
          class: tw`flex-col w-96`
        },
          m(Input, {
            contentLeft: m(Icon, { name: Icons.SEARCH }),
            placeholder: "Ricerca Cliente",
            minlength: 11,
            maxlength: 11,
            type: "tel",
            class: tw`piva w-full`,
            onkeyup(e: any) {
              searchQuery = e.target.value.toUpperCase();
            },
          }),
          clients && clients.length != 0 && m(
            `.list_wrap`,
            {
              class: tw`relative`,
            },
            m(
              List,
              {
                class: tw`rounded-md shadow-xl`,
              },
              v.attrs.store.clients.length > 0 && v.attrs.store.clients
                .filter((item: ClientInterface) => {
                  return filterCheck(item, searchQuery);
                })
                .map((fItem: ClientInterface, i: number) => {
                  return m(ListItem, {
                    key: i,
                    contentLeft: m(".client_item", [
                      m(".client_piva", fItem.header),
                      m(".client_piva", fItem.PIVA),
                    ]),
                    onclick(e) {
                      // v.attrs.store.inputs = fItem;
                      for (let f in v.attrs.store.inputs) {
                        v.attrs.store.inputs[f] = fItem[f]
                      }
                      v.attrs.store.selectedClient = fItem;
                      v.attrs.store.newClient = undefined;
                      if (fItem.TIPO == "TESTER") { v.attrs.store.iva = 1.04 }
                      console.log(fItem)
                      selTab(2, v.attrs.store);
                    },
                    contentRight: m(Icon, { name: Icons.ARROW_RIGHT }),
                    allowOnContentClick: true,
                  });
                }),
            ),
          ),
        ),
      ]);
    },
  };
};
export function createEvent<T>(obj: T) {
  const ev = new CustomEvent("create-stream", {
    detail: obj,
  });
  return ev;
}
const sendReadEvent = async () => {
  // const ev = createEvent({
  //   action: "read",
  //   arg: localStorage.dataPath + "/clienti.txt",
  // });
  // document.dispatchEvent(ev);
};

const filterCheck = (item, query) => {
  if (item && query != "") {
    const q = query;
    const headerMatch = item.header.includes(q);
    const ivaMatch = item.PIVA ? item.PIVA.includes(q) : false;
    return headerMatch || ivaMatch;
  } else return false;
};
