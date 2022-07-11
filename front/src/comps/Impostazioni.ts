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
} from "construct-ui";
import { TabsProps } from "../App";

export const Impostazioni = (v: Vnode<TabsProps, {}>) => {
  let settings = {};
  return {
    view() {
      return m(".tab", {
        class: v.attrs.active ? "active" : "",
      }, [
        m("h1", { class: tw`text-xl font-bold mb-4` }, "Impostazioni"),
        m(
          Form,
          {
            gutter: 15,
            onsubmit(e) {
              e.preventDefault();
              const target = e.target as HTMLFormElement;
              const inputs = Array.from(target.elements);
              inputs.forEach((input: HTMLInputElement) => {
                const { name, value } = input;
                settings[name] = value;
                localStorage[name] = settings[name];
              });
              location.reload();
            },
          },
          m(
            FormGroup,
            {
              span: {
                xs: 12,
                sm: 12,
                md: 12,
              },
            },
            // [
            //   m(FormLabel, { for: 'dataPath' }, 'Percorso Data'),
            //   m(Input, {
            //     contentLeft: m(Icon, { name: Icons.PACKAGE }),
            //     id: 'dataPath',
            //     name: 'dataPath',
            //     placeholder: 'ES: C:/Users/utente/Desktop/Data',
            //     value: localStorage.dataPath,
            //   })
            // ],
            [
              m(FormLabel, { for: "dataPath" }, "Negozio"),
              m(
                ControlGroup,
                { class: tw`block` },
                m(Select, {
                  class: tw`block w-48`,
                  name: "shop",
                  options: [
                    "GHERLINDA",
                    "ROMAEST",
                    "GLOBO",
                    "PORTE DI CATANIA",
                    "CASAMASSIMA",
                    "FIUMARA",
                    "CITTAFIERA",
                  ],
                  value: localStorage.shop || "GHERLINDA",
                }),
              ),
            ],
            m(Button, {
              class: tw`mt-8 float-right`,
              type: "submit",
              label: "Applica",
              intent: "primary",
            }),
          ),
        ),
      ]);
    },
  };
};
