import m, { Vnode } from "mithril";
import stream from "mithril/stream";
import Stream from "mithril/stream";
import { tw } from "twind";
import {
  Button,
  Form,
  FormGroup,
  FormLabel,
  Input,
  Select,
  Switch,
} from "construct-ui";
import { selTab, StoreInterface, TabsProps } from "../App";
import { setAttributes } from "../utils";
import { AppToaster } from "./AppToaster";

type ClientFormField =
  | "Indirizzo"
  | "Città"
  | "CAP"
  | "Provincia"
  | "Regione"
  | "Denominazione"
  | "P_IVA"
  | "Cod_Fiscale"
  | "Cod_Univoco"
  | "Email"
  | "PEC"
  | "Contatto"
  | "Telefono";

type InputType = {
  info?: string;
  options?: string[];
  default?: any;
  props?: {
    type?: string;
    maxlength?: number;
    minlength?: number;
    pattern?: string;
    required?: boolean;
    disabled?: boolean;
  };
  value?: string;
  span?: number;
};

export type InputConfType = Record<ClientFormField, InputType>;

// change html element's required attribute

const handleClientGroupChange = (
  e: InputEvent,
  store: StoreInterface,
  clientGroup: Stream<string>,
) => {
  const cg = (e.target as HTMLInputElement).value;
  clientGroup(cg);

  const ivaSwitch = document.querySelector(
    ".iva_switch input",
  ) as HTMLInputElement;

  if (cg == "DITTA INDIVIDUALE") {
    ivaSwitch.checked = false;
    store.iva = 1.22;
    ivaSwitch.disabled = true;

    setAttributes(".input-PIVA input", {
      required: true,
    });

    setAttributes(".input-PEC input", {
      required: true,
    });

    AppToaster.notify({
      msg: `Le ditte indivuduali riportano:
        {NOME CLIENTE} o
      {NOME DI FANTASIA DITTA} di {NOME CLIENTE}.
        Il CF deve essere di 11 caratteri alfanumerici`,
      intent: "warning",
    });
  } else if (cg == "SOCIETA'") {
    setAttributes(".input-PEC input", {
      required: true,
    });

    ivaSwitch.checked = false;
    store.iva = 1.22;
    ivaSwitch.disabled = true;

    AppToaster.notify({
      msg: `PIVA e' obbligatoria. Solitamente il CF e' uguale alla PIVA.
        In rari casi il CF puo' essere di 11 numeri`,
      intent: "warning",
    });
  } else {
    // privato

    setAttributes(".input-PIVA input", {
      required: false,
    });

    setAttributes(".input-PEC input", {
      required: false,
    });

    store.inputs.CODUNIVOCO = "ESENTE";
    store.inputs.PIVA = "";

    AppToaster.notify({
      msg: `CF e' obbligatorio.
        il CODUNIVOCO = ESENTE. Se ha diritto al 4% salvare le copie dei documenti`,
      intent: "warning",
    });
  }
};

export const InserisciCliente = (
  v: Vnode<
    TabsProps,
    { selectedRegion: string }
  >,
) => {
  let { localSettings } = v.attrs.store;
  const clientGroup: Stream<string> = stream("");

  const clientUserInput: InputConfType = {
    "Denominazione": {
      info: "Mario Rossi O MIRAUTO SRL",
      props: {
        pattern: ".*[^\\.]*",
        // pattern: ".*[^\\.]*#\\s+\\w+",
        required: true,
      },
      span: 12,
    },
    "P_IVA": {
      info: "Codice a 11 numeri o vuoto nel caso di privati",
      props: {
        type: "tel",
        maxlength: 11,
        pattern: "[0-9]{11}",
        required: true,
      },
      span: 12,
    },
    "Cod_Fiscale": {
      info:
        "Per le società è spesso uguale a PIVA. Negli altri casi CF alfanumerico",
      props: {
        required: true,
        minlength: 11,
        maxlength: 16,
        pattern: `([A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]|\\d{11})`,
      },
      span: 12,
    },
    "Indirizzo": {
      info: "VIA G.ALBINI, 19",
      props: {
        required: true,
        pattern: ".*",
        // pattern: ".*#\\s+[0-9]{5}\\s+#.*#\\s+\\w{2}\\s+#.*",
      },
      span: 6,
    },
    "CAP": {
      info: "06123",
      props: {
        required: true,
        minlength: 5,
        maxlength: 5,
        pattern: "[0-9]{5}",
      },
      span: 4,
    },
    "Città": {
      info: "PERUGIA",
      props: {
        required: true,
        pattern: "\\w+",
      },
      span: 6,
    },
    "Provincia": {
      info: "PG",
      props: {
        required: true,
        minlength: 2,
        maxlength: 2,
        pattern: "\\w{2}",
      },
      span: 3,
    },
    "Regione": {
      info: "UMBRIA",
      props: {
        required: true,
      },
      options: [
        "PUGLIA",
        "BASILICATA",
        "ABRUZZO",
        "CALABRIA",
        "CAMPANIA",
        "EMILIA",
        "FRIULI",
        "LAZIO",
        "LIGURIA",
        "LOMBARDIA",
        "MARCHE",
        "MOLISE",
        "PIEMONTE",
        "SARDEGNA",
        "SICILIA",
        "TOSCANA",
        "TRENTINO",
        "UMBRIA",
        "VAL_D'AOSTA",
        "VENETO",
      ],
      default: "",
      span: 3,
    },
    "Cod_Univoco": {
      info: "Codice a 7 car alfanumerici o ESENTE",
      props: {
        required: true,
        type: "text",
        maxlength: 7,
        minlength: 6,
        pattern: "(\\w{7}|esente|Esente|ESENTE)",
      },
      span: 6,
    },
    "PEC": {
      info: "Per la fattura elettronica serve o il CODUNIVOCO o la PEC",
      props: {
        required: true,
        type: "text",
        pattern: ".*@.*\\.\\w*",
      },
    },
    "Email": {
      info: "Mail del richiedente fatture",
      props: {
        required: true,
        pattern: "(.*@.*\\.\\w*|...)",
      },
    },
    "Contatto": {
      info: "Nome e Cognome del richiedente fattura. Oppure ...",
      props: {
        required: true,
        minlength: 3,
        pattern: "..*",
      },
    },
    "Telefono": {
      info: "Tel del richiedente fattura",
      props: {
        type: "tel",
        required: true,
        pattern: "..*",
      },
    },
  };

  const formGroups: {
    title: string;
    fields: ClientFormField[];
  }[] = [
    {
      title: "Dati aziendali/anagrafici",
      fields: [
        "Denominazione",
        "P_IVA",
        "Cod_Fiscale",
        "Cod_Univoco",
        "PEC",
      ],
    },
    {
      title: "Indirizzo",
      fields: [
        "Indirizzo",
        "Città",
        "CAP",
        "Provincia",
        "Regione",
        "Contatto",
        "Telefono",
        "Email",
      ],
    },
  ];

  return {
    onupdate() {
      localSettings = v.attrs.store.localSettings;
    },
    view() {
      return m(
        `.tab`,
        {
          class: v.attrs.active ? "active" : "",
        },
        [
          m("h1", { class: tw`text-xl font-bold mb-4` }, "Inserisci Cliente"),
          m(
            "style",
            `
            .cui-form {
              max-width: 700px;
              padding-left: .5rem;
              padding-right: .5rem;
            }
            .cui-form .cui-form-group {
              padding-left: .5rem;
              padding-right: .5rem;
            }
            .cui-form .cui-form-label {
              text-transform: capitalize;
            }
            `,
          ),
          m(
            Form,
            {
              class: tw("px-6"),
              onsubmit: (e: SubmitEvent) => handleSubmit(e, v),
            },
            m(
              FormGroup,
              {
                span: {
                  xs: 12,
                  md: 6,
                },
              },
              m(Switch, {
                label: "IVA al 4%",
                class: "iva_switch",
                disabled: clientGroup() != "PRIVATO",
                onchange() {
                  let { attrs: { store: { iva } } } = v;
                  if (iva === 1.04) v.attrs.store.iva = 1.22;
                  else iva = v.attrs.store.iva = 1.04;
                  console.log(iva);
                },
              }),
            ),
            m(
              FormGroup,
              {
                span: {
                  xs: 12,
                  md: 6,
                },
              },
              m(Select, {
                required: true,
                value: clientGroup(),
                options: ["SOCIETA'", "DITTA INDIVIDUALE", "PRIVATO"],
                onchange(e: InputEvent) {
                  handleClientGroupChange(e, v.attrs.store, clientGroup);
                },
              }),
            ),
            formGroups.map((group) => {
              return group.fields.map((field) => {
                return m(FormGroup, {
                  span: {
                    xs: 12,
                    md: clientUserInput[field].span || 12,
                  },
                }, [
                  m(FormLabel, {
                    for: field,
                    title: clientUserInput[field].info,
                  }, field),
                  getInputVnode(clientUserInput, field, v),
                ]);
              });
            }),
            m(
              ".button_wrap",
              {
                class: tw`w-full flex justify-evenly mt-4`,
              },
              m(Button, {
                label: "Pulisci",
                intent: "negative",
                onclick() {
                  v.attrs.store.selectedClient = undefined;
                  v.attrs.store.newClient = undefined;
                  const inputs = v.attrs.store.inputs;
                  for (let f in inputs) {
                    inputs[f] = "";
                  }
                },
              }),
              m(Button, {
                type: "submit",
                label: "Aggiungi Cliente",
                intent: "positive",
              }),
            ),
          ),
        ],
      );
    },
  };
};

const getInputVnode = (
  clientUserInput: InputConfType,
  field: ClientFormField,
  v: Vnode<TabsProps, { selectedRegion: string }>,
) => {
  const input = clientUserInput[field];
  const isSelect = input.options ? true : false;

  switch (isSelect) {
    case true:
      return [
        m("br"),
        m(Select, {
          required: true,
          options: input.options,
          class: `input-${field}`,
          id: field,
          name: field,
          value: v.state.selectedRegion,
          oncreate: (e: any) => v.state.selectedRegion = "",
          onchange: (e: any) => v.state.selectedRegion = e.target.value,
        }),
      ];
    case false:
      return m(Input, {
        placeholder: input.info,
        class: `input-${field}`,
        id: field,
        name: field,
        basic: true,
        disabled: v.attrs.store.selectedClient ? true : false,
        // value: v.attrs.store.inputs[field],
        ...input?.props,
        // oncreate() {
        //   if (field = "START") {
        //     const el: HTMLInputElement =
        //       document.querySelector(`.input-${field}`);
        //     console.log(el)
        //     // const dateString = input.default();
        //     // el.value = dateString;
        //     // v.attrs.store.inputs[field] = dateString;
        //   }
        // },
        onchange(e: InputEvent) {
          const val = (e.target as HTMLInputElement).value;
          const isValid = new RegExp(clientUserInput[field].props.pattern).test(
            val,
          );

          if (field == "Cod_Univoco") {
            if (isValid) {
              setAttributes("#PEC", {
                required: false,
              });
            } else {
              setAttributes("#PEC", {
                required: true,
              });
            }
          } else if (field === "PEC") {
            if (isValid) {
              setAttributes("#Cod_Univoco", {
                required: false,
              });
            } else {
              setAttributes("#Cod_Univoco", {
                required: true,
              });
            }
          }
        },
      });
  }
};

const handleSubmit = async (
  e: SubmitEvent,
  v: Vnode<TabsProps, {}>,
) => {
  e.preventDefault();

  const target = e.target as HTMLFormElement;
  const inputs = target.elements;
  const values = <Record<ClientFormField, string>> {};

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i] as HTMLInputElement;
    values[input.name] = input.value.toUpperCase();
  }

  const addressString = `${values["Indirizzo"]} # ${values["CAP"]} # ${
    values["Città"]
  } # ${values["Provincia"]} # ${values["Regione"]}`;

  v.attrs.store.selectedClient = {
    header: `${values["Denominazione"]} # ${values["Regione"]}`,
    INDIRIZZO: addressString,
    PIVA: values["P_IVA"],
    CF: values["Cod_Fiscale"],
    CODUNIVOCO: values["Cod_Univoco"],
    PEC: values["PEC"],
    EMAIL: values["EMAIL"],
    CONTATTO: values["Contatto"],
    TEL: values["Telefono"],
    LISTINO: "L4",
    PAGAMENTO: "",
    TRASPORTA: "DESTINATARIO",
    START: "11/10/2022 ROMAEST",
  };

  const written = await window.writeToClientsFile(v.attrs.store.selectedClient);

  console.log({ written });

  selTab(1, v.attrs.store);
};
