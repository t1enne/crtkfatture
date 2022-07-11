import m from 'mithril'
import { List, ListItem, Icons, Icon, Button, Tag } from 'construct-ui'
import { tw } from 'twind'
import { ClientInterface } from '../App'
import { cl } from '../utils.js'


export const PIvaInput = () => {
  const filterCheck = (item, attrs) => {
    if (item && attrs.PIVA != "") {
      const q = attrs.PIVA
      const headerMatch = item.header.includes(q)
      const ivaMatch = item.PIVA ? item.PIVA.includes(q) : false
      return headerMatch || ivaMatch
    } else { return false }
  }
  return {
    view(v) {
      return m(`.list_wrap`, {
        class: tw`relative`,
      },
        m(List, {
          class: tw`rounded-md shadow-xl`
        },
          v.attrs.clients.length > 0 && v.attrs.clients
            .filter((item: ClientInterface) => {
              return filterCheck(item, v.attrs.PIVA)
            })
            .map((fItem: ClientInterface, i: number) => {
              return m(ListItem, {
                key: i,
                contentLeft: m('.client_item', [
                  m('.client_piva', fItem.header),
                  m('.client_piva', fItem.PIVA),
                ]),
                onclick(e) {
                  // v.attrs.inputs = v.attrs.clients[i]
                  for (const ind in v.attrs.clients[i]) {
                    const f = v.attrs.clients[i][ind]
                    console.log(f)
                    cl(`.input-${f} input`).value = 'hey'
                  }
                  // v.attrs.inputStream(v.attrs.clients[i])
                },
                contentRight: m(Icon, { name: Icons.ARROW_RIGHT }),
                allowOnContentClick: true
              })
            }
            )
        ))
    }
  }
}
