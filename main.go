package main

import (
	"crypto/tls"
	"embed"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"strings"
	"time"

	mail "github.com/xhit/go-simple-mail/v2"
	"github.com/zserge/lorca"
)

//go:embed dist
var fs embed.FS

// Go types that are bound to the UI must be thread-safe, because each binding
// is executed in its own goroutine. In this simple case we may use atomic
// operations, but for more complex cases one should use proper synchronization.
type Config struct {
	Shop      string   `json:"shop"`
	Shops     []string `json:"shops"`
	To        string   `json:"to"`
	Venditore string   `json:"venditore"`
	Venditori []string `json:"venditori"`
	Pwd       string   `json:"pwd"`
}

type Client struct {
	Header     string `json:"header"`
	INDIRIZZO  string
	PIVA       string
	CF         string
	CODUNIVOCO string
	PEC        string
	EMAIL      string
	CONTATTO   string
	PAGAMENTO  string
	TEL        string
	LISTINO    string
	TRASPORTA  string
	START      string
}

func readConfig() string {
	configFile, err := os.ReadFile("data/config.json")
	check(err)

	return string(configFile)
}

func parseConfig(configContent string) Config {
	configFile, err := os.ReadFile("data/config.json")
	check(err)
	var config = Config{}
	err = json.Unmarshal(configFile, &config)
	check(err)

	return config
}

func readClientsFile(array *[]Client) {
	clientsFileContent, err := os.ReadFile("data/clients.json")
	check(err)

	err = json.Unmarshal(clientsFileContent, array)
	check(err)
}

func sendMail(config Config, subject string, mailBody string) bool {

	server := mail.NewSMTPClient()

	// SMTP Server
	server.Host = "smtps.aruba.it"
	server.Port = 465
	server.Username = "incassi@cortekstore.com"
	server.Password = config.Pwd
	server.Encryption = mail.EncryptionSSLTLS

	server.KeepAlive = false
	server.ConnectTimeout = 10 * time.Second
	server.SendTimeout = 10 * time.Second
	server.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	smtpClient, err := server.Connect()
	if err != nil {
		log.Fatal(err)
	}

	// get shops address from name
	shopSplit := strings.ReplaceAll(config.Shop, " ", "")
	shopJoined := strings.ToLower(shopSplit)
	log.Println(shopJoined + "@cortekstore.com")

	// New email simple html with inline and CC
	email := mail.NewMSG()

	email.SetFrom("incassi@cortekstore.com").
		AddTo(config.To).
		AddCc(shopJoined + "@cortekstore.com").
		SetSubject(subject)

	email.SetBody(mail.TextPlain, mailBody)

	err = email.Send(smtpClient)
	if err != nil {
		return false
	} else {
		return true
	}
}

func filterClients(clients []Client, query string) []Client {
	var found []Client
	for _, client := range clients {
		if strings.Contains(client.Header, query) {
			found = append(found, client)
		}
	}
	return found
}

// func getClients() []stringMap {
// 	dat, err := os.ReadFile("./data/clienti.txt")
// 	check(err)
// 	json := normalizeClients(string(dat))
// 	return json
// }
//
// func normalizeClients(data string) []stringMap {
// 	clientFields := []string{"PIVA", "INDIRIZZO", "CODUNIVOCO", "PEC", "TEL", "EMAIL", "CONTATTO", "LISTINO", "TRASPORTA", "PAGAMENTO", "TIPO", "START"}
// 	re, err := regexp.Compile(`HEADER END.*\s*.*\s*`)
// 	check(err)
// 	noHeaderData := re.Split(data, 2)[1]
// 	re, err = regexp.Compile(`(?m)(\n^\s+|\r^\s+)`)
// 	clientsRawArray := re.Split(noHeaderData, -1)
//
// 	var jsonArr []stringMap
// 	for i := 0; i < len(clientsRawArray); i++ {
// 		client := strings.TrimSpace(clientsRawArray[i])
// 		clientMap := parseFields(client, clientFields)
// 		jsonArr = append(jsonArr, clientMap)
// 	}
// 	check(err)
// 	return jsonArr
// }
//
// func parseFields(client string, fields []string) stringMap {
// 	clientMap := make(stringMap)
// 	re, err := regexp.Compile(`\n`)
// 	check(err)
// 	for i, row := range re.Split(client, -1) {
// 		if i == 0 {
// 			// header
// 			clientMap["header"] = row
// 		} else {
// 			for _, field := range fields {
// 				if strings.Contains(row, field) {
// 					split := strings.TrimSpace(strings.Split(row, field)[1])
// 					clientMap[field] = split
// 				}
// 			}
// 		}
// 	}
// 	return clientMap
// }

func main() {
	args := []string{}
	if runtime.GOOS == "linux" {
		args = append(args, "--class=Lorca")
	}
	pwd := flag.String("pwd", "", "Email login Password")
	flag.Parse()

	ui, err := lorca.New("", "", 1024, 980, args...)

	if err != nil {
		log.Fatal(err)
	}
	defer ui.Close()

	configFileContent := readConfig()
	var clients []Client
	readClientsFile(&clients)

	log.Println(clients)

	config := parseConfig(configFileContent)
	log.Println(config)

	isDev := true

	if *pwd != "" {
		config.Pwd = *pwd
		isDev = false
	}

	log.Printf("Running in DEV: %t", isDev)
	// A simple way to know when UI is ready (uses body.onload event in JS)
	ui.Bind("start", func() {
		log.Println("UI is ready")
	})

	ui.Bind("fetchConfigFileContent", func() string {
		log.Print("fetching config file\n\n")
		return configFileContent
	})

	ui.Bind(("findClients"), func(query string) []Client {
		filtered := filterClients(clients, query)
		return filtered
	})

	ui.Bind("writeToClientsFile", func(client Client) bool {
		log.Print("writing to clients file\n\n")
		clients = append(clients, client)
		jsonBytes, err := json.MarshalIndent(clients, "", "  ")
		check(err)

		err = os.WriteFile(`data/clients.json`, jsonBytes, 0644)
		if err != nil {
			return false
		} else {
			return true
		}
	})

	ui.Bind("sendMail", func(subject, mailBody string) bool {
		log.Println(mailBody)
		success := sendMail(config, subject, mailBody)
		return success
	})

	ui.Bind("writeConfigFile", func(fileContent string) bool {
		bytes := []byte(fileContent)
		// update process config
		config = parseConfig(fileContent)
		log.Println(config)
		err := os.WriteFile(`data/config.json`, bytes, 0644)
		if err != nil {
			return false
		} else {
			return true
		}
	})

	// Load HTML.
	// You may also use `data:text/html,<base64>` approach to load initial HTML,
	// e.g: ui.Load("data:text/html," + url.PathEscape(html))

	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		log.Fatal(err)
	}
	defer ln.Close()
	go http.Serve(ln, http.FileServer(http.FS(fs)))

	if isDev {
		ui.Load(fmt.Sprintf("http://%s/front/dist", "127.0.0.1:3000"))
	} else {
		ui.Load(fmt.Sprintf("http://%s/dist", ln.Addr()))
	}

	// Wait until the interrupt signal arrives or browser window is closed
	sigc := make(chan os.Signal)
	signal.Notify(sigc, os.Interrupt)
	select {
	case <-sigc:
	case <-ui.Done():
	}
}

func check(e error) {
	if e != nil {
		fmt.Println(e)
		panic(e)
	}
}
