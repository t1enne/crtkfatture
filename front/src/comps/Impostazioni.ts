import m, { Vnode } from "mithril";
import { tw } from "twind";
import {
  Button,
  ControlGroup,
  Dialog,
  Form,
  FormGroup,
  FormLabel,
  Icon,
  Icons,
  Input,
  Select,
  Tag,
} from "construct-ui";
import { TabsProps } from "../App";
import { AppToaster } from "./AppToaster";
import { cl } from "../utils";

export const Impostazioni = (
  v: Vnode<TabsProps, {}>,
) => {
  let localSettings: Window["localSettings"];
  let isDialogOpen = false;

  async function addSeller() {
    const dialog = cl("dialog#add-seller") as HTMLDialogElement;
    const target = (cl("form#add-seller") as any);
    const inputs = target.elements;
    localSettings?.venditori.push(inputs[0].value);
    isDialogOpen = false;
    await updateConfig(localSettings);
    m.redraw();
  }

  return {
    oninit() {
      console.log("init of Settings");
    },
    onupdate() {
      localSettings = v.attrs.store.localSettings;
    },
    view() {
      return m(".tab", {
        class: v.attrs.active ? "active" : "",
      }, [
        m("h1", { class: tw`text-xl font-bold mb-4` }, "Impostazioni"),
        m(Dialog, {
          isOpen: isDialogOpen,
          hasCloseButton: false,
          title: "Conferma",
          content: "Aggiungere venditore?",
          footer: m("", [
            m(Button, {
              label: "Chiudi",
              onclick: () => isDialogOpen = false,
            }),
            m(Button, {
              label: "Conferma",
              intent: "primary",
              onclick: async () => await addSeller(),
            }),
          ]),
        }),

        m(Form, {
          id: "add-seller",
          onsubmit(e: any) {
            e.preventDefault();
            isDialogOpen = true;
          },
        }, [
          m(
            FormGroup,
            m(FormLabel, { for: "venditore" }, "Aggiungi Venditore"),
            m(
              ControlGroup,
              { class: tw`flex` },
              m(Input, {
                // class: tw`block w-48`,
                minlength: 1,
                maxlength: 10,
                name: "venditore",
                id: "venditore",
                contentLeft: m(Icon, { name: Icons.USER }),
              }),
              m(Button, {
                intent: "primary",
                type: "submit",
                label: m(Icon, { name: Icons.PLUS }),
              }),
            ),
          ),
          m(
            "div.seller-tags",
            {
              class: tw`flex flex-wrap pb-4`,
            },
            localSettings?.venditori
              .map((venditore) =>
                m(Tag, {
                  label: venditore,
                  size: "sm",
                  removable: true,
                  async onRemove(e: any) {
                    if (!localSettings) return;
                    console.log({ localSettings });
                    const span = e.target.parentElement.parentElement;
                    const seller = span.textValue;
                    const index = localSettings?.venditori.findIndex(
                      (venditore) => seller === venditore,
                    );
                    localSettings?.venditori.splice(index, 1);
                    await updateConfig(localSettings);
                  },
                })
              ),
          ),
        ]),
        m(
          Form,
          {
            gutter: 15,
            async onsubmit(e: SubmitEvent) {
              e.preventDefault();
              const target = e.target as HTMLFormElement;
              const inputs = Array.from(target.elements);
              inputs.forEach((input: HTMLInputElement) => {
                const { name, value } = input;
                localSettings[name] = value;
              });
              await updateConfig(localSettings);
            },
          },
          m(
            FormGroup,
            {
              class: tw`flex flex-col`,
              span: {
                xs: 12,
                sm: 12,
                md: 12,
              },
            },
            [
              m(FormLabel, {
                for: "shop",
                title:
                  "Questo campo viene utilizzato per spedire la copia della mail della fattura. Quindi PORTE DI CATANIA -> portedicatania@cortekstore.com e così via",
              }, "Negozio"),
              m(
                ControlGroup,
                { class: tw`block` },
                m(Select, {
                  class: tw`block w-48`,
                  name: "shop",
                  options: localSettings?.shops || [],
                  value: localSettings?.shop,
                  defaultValue: "",
                }),
              ),
            ],
            m(Button, {
              class: tw`mt-8 self-center`,
              type: "submit",
              label: "Salva Impostazioni",
              intent: "positive",
            }),
          ),
        ),
      ]);
    },
  };
};

async function updateConfig(newSettings: Window["localSettings"]) {
  const saved = await window.writeConfigFile(
    JSON.stringify(newSettings, null, 2),
  );
  if (saved) {
    AppToaster.notify({
      intent: "positive",
      msg: "Impostazioni salvate!",
    });
  } else {
    AppToaster.notify({
      intent: "negative",
      msg: "Non sono riuscito a scrivere il file!",
    });
  }
}
