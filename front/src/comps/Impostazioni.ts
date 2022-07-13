import m, { Vnode } from "mithril";
import { tw } from "twind";
import {
  Button,
  ControlGroup,
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

export const Impostazioni = (
  v: Vnode<TabsProps, { localSettings: Window["localSettings"] }>,
) => {
  const { localSettings } = v.attrs.store
  
  return {
    oninit() {
      console.log('init of Settings')
    },
    view() {
      return m(".tab", {
        class: v.attrs.active ? "active" : "",
      }, [
        m("h1", { class: tw`text-xl font-bold mb-4` }, "Impostazioni"),
        m(Form, {
          async onsubmit(e: any) {
            e.preventDefault();
            const { target } = e;
            const inputs = target.elements;
            localSettings.venditori.push(inputs[0].value);
            m.redraw()
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
            localSettings.venditori
              .map((venditore) =>
                m(Tag, {
                  label: venditore,
                  rounded: true,
                  size: "sm",
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
              const saved = await window.writeConfigFile(
                JSON.stringify(localSettings, null, 2),
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
              m(FormLabel, { for: "shop" }, "Negozio"),
              m(
                ControlGroup,
                { class: tw`block` },
                m(Select, {
                  class: tw`block w-48`,
                  name: "shop",
                  options: localSettings?.shops || [],
                  value: localSettings?.shop || "",
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
