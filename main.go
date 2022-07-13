package main

import (
	"embed"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"runtime"

	"github.com/zserge/lorca"
)

//go:embed dist
var fs embed.FS

// Go types that are bound to the UI must be thread-safe, because each binding
// is executed in its own goroutine. In this simple case we may use atomic
// operations, but for more complex cases one should use proper synchronization.
type Config struct {
	Shop    string   `json:"shop"`
	Shops   []string `json:"shops"`
	Regioni []string `json:"regioni"`
	From    string   `json:"from"`
	To      string   `json:"to"`
}

func readConfig() string {
	configFile, err := os.ReadFile("./config.json")
	check(err)

	return string(configFile)
}

func parseConfig(configContent string) Config {
	configFile, err := os.ReadFile("./config.json")
	check(err)
	var config = Config{}
	err = json.Unmarshal(configFile, &config)
	check(err)

	return config
}

// func writeConfig(configString string) err error {

// 	return true
// }

func sendMail(config Config) string {
	fmt.Println(config.From)
	return config.From
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

	ui, err := lorca.New("", "", 1024, 980, args...)
	if err != nil {
		log.Fatal(err)
	}
	defer ui.Close()

	configFileContent := readConfig()
	config := parseConfig(configFileContent)
	// A simple way to know when UI is ready (uses body.onload event in JS)
	ui.Bind("start", func() {
		log.Println("UI is ready")
	})

	ui.Bind("fetchConfigFileContent", func() string {
		log.Println("fetching config file")
		return configFileContent
	})

	ui.Bind("sendMail", func() {
		sendMail(config)
	})

	ui.Bind("writeConfigFile", func(fileContent string) bool {
		bytes := []byte(fileContent)
		err := os.WriteFile(`./config.json`, bytes, 0644)
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
	// ui.Load(fmt.Sprintf("http://%s/dist", ln.Addr()))
	ui.Load(fmt.Sprintf("http://%s/front/dist", "127.0.0.1:3000"))

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
