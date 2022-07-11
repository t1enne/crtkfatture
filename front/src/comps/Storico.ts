import m, { Vnode } from 'mithril'
import { tw } from 'twind'
import { Form, FormGroup, Input, FormLabel, Icon, Icons, Button, Select, ControlGroup } from 'construct-ui'
import { TabsProps } from '../../out/mithril-app-linux-x64/resources/app/src/App'

export const Storico = (v: Vnode<TabsProps, {}>) => {
  return {
    oninit() {

    },
    view() {
      return m('.tab',
        {
          class: v.attrs.active ? "active" : "",
        },
        [
          m("h1", { class: tw`text-xl font-bold mb-4` }, "Storico"),
          m('div.orders-history',
          )
        ]
      )
    }
  }
}
