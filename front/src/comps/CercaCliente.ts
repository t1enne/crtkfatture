import m, { Vnode } from "mithril";
import { tw } from "twind";
import { ControlGroup, Icon, Icons, Input, List, ListItem } from "construct-ui";
import { ClientInterface, selTab, TabsProps } from "../App";

export const CercaCliente = (v: Vnode<TabsProps, {}>) => {
  let clients: ClientInterface[] = [];
  let searchQuery = "";
  return {
    view() {
      return m(`.tab`, {
        class: v.attrs.active ? "active" : "",
      }, [
        m("h1", { class: tw`text-xl font-bold mb-4` }, "Cerca Cliente"),
        m(
          ControlGroup,
          {
            class: tw`flex-col w-96`,
          },
          m(Input, {
            contentLeft: m(Icon, { name: Icons.SEARCH }),
            placeholder: "Ricerca Cliente",
            minlength: 1,
            maxlength: 11,
            type: "tel",
            class: tw`piva w-full`,
            async onkeyup(e: any) {
              searchQuery = e.target.value.toUpperCase();
              clients = await window.findClients(searchQuery);
              console.log(clients);
            },
          }),
          clients.length > 0 && m(
            `.list_wrap`,
            {
              class: tw`relative`,
            },
            m(
              List,
              {
                class: tw`rounded-md shadow-xl`,
              },
              clients
                .map((fItem: ClientInterface, i: number) => {
                  return m(ListItem, {
                    key: i,
                    contentLeft: m(".client_item", [
                      m(".client_piva", fItem.header),
                      m(".client_piva", fItem.PIVA),
                    ]),
                    onclick(e) {
                      // for (let f in v.attrs.store.newClient) {
                      //   v.attrs.store.newClient[f] = fItem[f];
                      // }
                      v.attrs.store.selectedClient = fItem;
                      // if (fItem.TIPO == "TESTER") v.attrs.store.iva = 1.04;
                      console.log(fItem);
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

// const filterCheck = (item, query) => {
//   if (item && query != "") {
//     const q = query;
//     const headerMatch = item.header.includes(q);
//     const ivaMatch = item.PIVA ? item.PIVA.includes(q) : false;
//     return headerMatch || ivaMatch;
//   } else return false;
// };
