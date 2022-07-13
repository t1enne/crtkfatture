import m, { Vnode } from "mithril";
import stream from "mithril/stream";
import { tw } from "twind";
import {
  Button,
  Card,
  ControlGroup,
  Form,
  FormLabel,
  Icon,
  Icons,
  Input,
  Overlay,
  Select,
  TextArea,
} from "construct-ui";
import { cl } from "../utils.js";
import { ClientInterface, StoreInterface, TabsProps } from "../App";
import { createEvent } from "./CercaCliente.js";

type LineItem = {
  qty<T>(n?: string | number): T;
  art(s?: string): string;
  price(n?: number): number;
  total(n?: number): number;
};
export const getDate = (f?: string) => {
  const now = new Date();
  let dd = now.getDate().toString();
  let mm = (now.getMonth() + 1).toString();
  const year = now.getFullYear();

  if (mm.length < 2) mm = "0".concat(mm);
  if (dd.length < 2) dd = "0".concat(dd);

  if (f && f == "dd/mm") {
    return `${dd}/${mm}`;
  } else {
    return `${dd}/${mm}/${year} `;
  }
};

const addSpaces = (keyString: string) => {
  const len = keyString.length;

  let spaces = "";
  const diff = 16 - len;
  for (let i = 0; i < diff; i++) {
    spaces += " ";
  }
  return spaces;
};

const euroTag = m("tag", {
  style: {
    position: "absolute",
    top: "50%",
    "padding-left": "5px",
    "text-align": "center",
    color: "#979797",
    transform: "translate(50%, -50%)",
  },
}, "€");

const parseNewClient = (client: ClientInterface) => {
  if (!client) return [];
  const arr = [];
  const newHeader = `*${client.header}`;

  arr.push("\n", newHeader);

  for (const key in client) {
    const value = client[key];

    if (value != "") arr.push(`${key}${addSpaces(key)}${value}`);
  }

  return arr.join("\n");
};

// function getNewClientNum(clients: ClientInterface[], client: ClientInterface) {
//   if (clients) {
//     const len = clients.length;
//     const lastHead = clients[len - 1]?.header;
//     const lastWithIva = parseInt(
//       lastHead?.match(/\*[0-9]*/)[0].replace("*", ""),
//     );
//     const lastWithoutIva = 20000 + len - lastWithIva;
//     if (client.TIPO && client.TIPO === "TESTER") {
//       return lastWithoutIva + 1;
//     } else {
//       return lastWithIva + 1;
//     }
//   } else {
//     return 0;
//   }
// }

const InserisciArticoli = (v: Vnode<TabsProps, {}>) => {
  let note = stream<string>(""),
    scontrino = stream<number>(0),
    lineItems: LineItem[] = [];

  const addLineItem = () => {
    let qty = stream(0),
      art = stream(""),
      price = stream(0),
      total = stream.merge([qty, price]).map((_) => {
        return qty() * price();
      });
    lineItems.push({ qty, art, price, total });
  };

  const getTotals = (tax?: number) => {
    let t = tax || 1;
    let gt = 0;
    let pieces = 0;
    lineItems.map((li) => {
      gt += li.total();
      pieces += parseInt(li.qty() as string);
    });
    return { price: (gt / t).toFixed(2), pieces };
  };

  const writeOrderText = (store: StoreInterface, items: LineItem[]) => {
    const { localSettings } = window;
    const lineItemsTexts = items.map((l) => {
      let { qty, art, price } = l;
      if (qty() < 10 && qty().toString().length < 2) {
        qty(parseInt("0".concat(qty().toString())));
      }
      return [
        qty(),
        art(),
        `(${getDate("dd/mm")})`,
        "PR",
        (price() / 1.22).toFixed(2),
        "Ax (D=0)",
      ];
    });

    const text = [
      parseNewClient(store.newClient),
      lineItemsTexts
        .map((l) => l.join("\t"))
        .join("\n"),
      `STATUS   PRONTO ${getTotals(1).pieces} COLLI`,
      `NOTAFT   RELATIVA SCONTRINO ${scontrino()} DEL ${getDate()}${localSettings.shop} € ${
        (parseFloat(getTotals(1.22).price) *
          v.attrs.store.iva).toFixed(2)
      } ${note()}`,
      `CAUSALE  RIF SCONTRINO ${scontrino()} DEL ${getDate()}${localSettings.shop}`,
    ].join("\n");

    return text;
  };

  let overl = {
    open: false,
    content: "wait",
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
    },
  };

  return {
    oncreate: addLineItem,
    view() {
      return m(".tab", {
        class: v.attrs.active ? "active" : "",
      }, [
        m("h1", { class: tw`text-xl font-bold mb-4` }, "Inserisci Articoli"),
        m(Overlay, {
          isOpen: overl.open,
          content: m("", { style: overl.style }, [
            m(Card, {
              class: tw`mx-auto my-48`,
            }, [
              m("h1", {
                class: tw`text-lg font-bold mb-6`,
              }, "Output"),
              m(".content", overl.content),
              m(Button, {
                label: "Close",
                onclick: () => overl.open = false,
              }),
            ]),
          ]),
        }),
        m(
          Form,
          {
            onsubmit: (e: SubmitEvent) => {
              e.preventDefault();
              console.log(e);
            },
          },
          m(
            ControlGroup,
            {
              class: tw`grid w-full`,
              style: {
                gridTemplateColumns: "70px 1fr 120px 120px",
              },
            },
            [
              m("h1", { class: tw`font-bold text-md ml-2` }, "Qtà"),
              m("h1", { class: tw`font-bold text-md ml-2` }, "Articolo"),
              m("h1", { class: tw`font-bold text-md ml-2` }, "Prezzo"),
              m("h1", { class: tw`font-bold text-md ml-2` }, "Totale"),
            ],
          ),
          lineItems.map(({ qty, art, price, total }) => {
            return m(LineItem, { qty, art, price, total });
          }),
          m(
            ControlGroup,
            {
              class: tw`w-full flex justify-end py-4`,
            },
            m(
              ".buttons",
              {
                class: tw`mt-4 flex justify-end`,
              },
              m(Button, {
                label: m(Icon, { name: Icons.MINUS }),
                class: tw`mr-2`,
                intent: "negative",
                onclick() {
                  lineItems.splice(-1, 1);
                },
              }),
              m(Button, {
                label: m(Icon, { name: Icons.PLUS }),
                class: tw`mr-2`,
                intent: "primary",
                onclick: addLineItem,
              }),
            ),
          ),
          m("h1", { class: tw`font-bold text-sm ml-2 mt-6` }, "Note Fatture"),
          m(
            ControlGroup,
            { class: tw`w-full ` },
            m(Input, {
              type: "text",
              required: true,
              fluid: true,
              value: note(),
              oninput(e) {
                note(e.target.value.toUpperCase());
              },
            }),
          ),
          m("h1", { class: tw`font-bold text-sm ml-2 mt-6` }, "Pagamento"),
          m(
            ControlGroup,
            { class: tw`w-full ` },
            m(Select, {
              options: [
                "CARTA",
                "CONTANTI",
                "BONIFICO",
                "ASSEGNO_CC",
                "ASSEGNO_CIRCOLARE",
              ],
              defaultValue: "",
              required: true,
              value: v.attrs.store.inputs.PAGAMENTO,
              onchange(e) {
                v.attrs.store.inputs.PAGAMENTO =
                  (e.target as HTMLInputElement).value;
              },
            }),
          ),
          m("h1", { class: tw`font-bold text-sm ml-2 mt-6` }, "Venditori"),
          m(
            ControlGroup,
            { class: tw`w-full ` },
            m(Select, {
              options: window.localSettings.venditori,
              defaultValue: "",
              required: true,
              value: window.localSettings.venditore,
              onchange: (e: any) => {
                window.localSettings.venditore = e.target.value;
              },
            }),
          ),
          m(
            ControlGroup,
            {
              class: tw`w-full grid grid-cols-4 mt-8`,
            },
            m("h1", "# Scontrino"),
            m("h1", "Imponibile"),
            m("h1", "IVA"),
            m("h1", "Totale Lordo"),
          ),
          m(
            ControlGroup,
            {
              class: tw`grid grid-cols-4`,
            },
            m(Input, {
              type: "number",
              min: 1,
              id: "scontrino",
              name: "scontrino",
              required: true,
              // contentLeft: m(Tag, { label: "#SCONTRINO" }),
              value: scontrino(),
              oninput(e: any) {
                scontrino(parseInt(e.target.value));
              },
            }),
            m(Input, {
              contentLeft: euroTag,
              disabled: true,
              value: getTotals(1.22).price,
            }),
            m(Input, {
              // contentLeft: m(Tag, { label: "Imponib." }),
              disabled: true,
              value: v.attrs.store.iva,
            }),
            m(Input, {
              // contentLeft: m(Tag, { label: "Totale" }),
              contentLeft: euroTag,
              disabled: true,
              value: (parseFloat(getTotals(1.22).price) *
                v.attrs.store.iva).toFixed(2),
            }),
          ),
          m(
            ".buttons",
            {
              class: tw`mt-4 flex justify-end`,
            },
            m(Button, {
              label: "Valida Ordine",
              type: "submit",
              intent: "primary",
              class: tw`mr-2`,
              onclick() {
                const orderText = (cl("textarea") as HTMLTextAreaElement).value;
                navigator.clipboard.writeText(orderText);
                // saveOrder(orderText);
              },
            }),
            //   m(Button, {
            //     label: "Esegui",
            //     intent: "positive",
            //     class: tw`mr-2`,
            //     async onclick() {
            //       let out = await runScript();
            //       overl.open = true;
            //       overl.content = out;
            //     },
            //   }),
          ),
        ),
        m(
          ControlGroup,
          {
            style: `margin-top: 10px;`,
            class: tw`w-full h-full`,
          },
          m(TextArea, {
            class: tw`w-full h-96`,
            style: {
              fontFamily: "monospace",
            },
            placeholder: "Recap ordine",
            fluid: true,
            value: writeOrderText(v.attrs.store, lineItems),
          }),
        ),
      ]);
    },
  };
};

const LineItem = (v: Vnode<LineItem, {}>) => {
  return {
    view() {
      return m(
        ControlGroup,
        {
          class: tw`grid w-full`,
          style: {
            gridTemplateColumns: "70px 1fr 120px 120px",
          },
        },
        m(Input, {
          type: "number",
          min: "0",
          required: true,
          placeholder: "qty",
          oninput(e: InputEvent) {
            v.attrs.qty((e.target as HTMLInputElement).value);
          },
        }),
        m(Input, {
          type: "text",
          required: true,
          placeholder: "articolo",
          value: v.attrs.art(),
          oninput(e: InputEvent) {
            v.attrs.art((e.target as HTMLInputElement).value.toUpperCase());
          },
        }),
        m(Input, {
          class: "art-price",
          required: true,
          type: "number",
          min: "0.00",
          step: "0.01",
          oninput(e: InputEvent) {
            v.attrs.price(parseFloat((e.target as HTMLInputElement).value));
          },
          // contentLeft: m(Icon, {
          //   name: Icons.DOLLAR_SIGN,
          // }),
          contentLeft: euroTag,
        }),
        m(Input, {
          disabled: true,
          contentLeft: euroTag,
          value: v.attrs.total(),
        }),
      );
    },
  };
};

const saveOrder = (text: string) => {
  const ev = createEvent({ text });
  document.dispatchEvent(ev);
};
export { InserisciArticoli };
