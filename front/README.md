# Cortek Store Fatture

Piccolo front end in Electron per semplificare l'inserimento delle fatture.
Alcune note:
società 
  piva == cf
  raramente piva != cf, in questi casi cf è numerico
ditte ind
  riportano il nome del cliente
  o nome di fantasia di nome del cliente
  deve avere cf alfanumerico
privato
  no partita iva
  deve avere cf
codunivoco
  non indisp
  cont forfettaria - assente
  può essere ESENTE
tipo
  tester se manca piva

## npm scripts

* `yarn dev` - Starts the development server at port 3000
* `yarn build` - Builds the application
* `yarn preview` - Serves the build files locally at port 5000

