package main

import (
	"embed"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"regexp"
	"runtime"
	"strings"

	"github.com/zserge/lorca"
)

//go:embed dist
var fs embed.FS

// Go types that are bound to the UI must be thread-safe, because each binding
// is executed in its own goroutine. In this simple case we may use atomic
// operations, but for more complex cases one should use proper synchronization.
type Config struct {
	shop string
}

func readConfig() string {
	configFile, err := os.ReadFile("./config.json")
	check(err)
	return string(configFile)
}

func getClients() []stringMap {
	dat, err := os.ReadFile("./data/clienti.txt")
	check(err)
	json := normalizeClients(string(dat))
	return json
}

func normalizeClients(data string) []stringMap {
	clientFields := []string{"PIVA", "INDIRIZZO", "CODUNIVOCO", "PEC", "TEL", "EMAIL", "CONTATTO", "LISTINO", "TRASPORTA", "PAGAMENTO", "TIPO", "START"}
	re, err := regexp.Compile(`HEADER END.*\s*.*\s*`)
	check(err)
	noHeaderData := re.Split(data, 2)[1]
	re, err = regexp.Compile(`(?m)(\n^\s+|\r^\s+)`)
	clientsRawArray := re.Split(noHeaderData, -1)

	var jsonArr []stringMap
	for i := 0; i < len(clientsRawArray); i++ {
		client := strings.TrimSpace(clientsRawArray[i])
		clientMap := parseFields(client, clientFields)
		jsonArr = append(jsonArr, clientMap)
	}
	// json, err := json.Marshal(jsonArr)
	check(err)
	return jsonArr
}

func parseFields(client string, fields []string) stringMap {
	clientMap := make(stringMap)
	re, err := regexp.Compile(`\n`)
	check(err)
	for i, row := range re.Split(client, -1) {
		if i == 0 {
			// header
			clientMap["header"] = row
		} else {
			for _, field := range fields {
				if strings.Contains(row, field) {
					split := strings.TrimSpace(strings.Split(row, field)[1])
					clientMap[field] = split
				}
			}
		}
	}
	return clientMap
}

func runScript() string {
	stdout, stderr := exec.Command("powershell", "cd C:/data/GestionFT_Fiumara; ./data/GestioneFT_Fiumara/Test1.exe").CombinedOutput()
	fmt.Println(stdout, stderr)
	return string(stdout)
}

func main() {
	args := []string{}
	if runtime.GOOS == "linux" {
		args = append(args, "--class=Lorca")
	}
	ui, err := lorca.New("", "", 480, 320, args...)
	if err != nil {
		log.Fatal(err)
	}
	defer ui.Close()

	configFileContent := readConfig()
	// A simple way to know when UI is ready (uses body.onload event in JS)
	ui.Bind("start", func() {
		log.Println("UI is ready")
		log.Println(configFileContent)
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
	ui.Load(fmt.Sprintf("http://%s/dist", ln.Addr()))
	// ui.Load(fmt.Sprintf("http://%s/front/dist", "127.0.0.1:3000"))

	// ui.Bind("fetchClients", getClients)
	// ui.Bind("runScript", runScript)
	// You may use console.log to debug your JS code, it will be printed via
	// log.Println(). Also exceptions are printed in a similar manner.
	ui.Eval(`
  console.log(configFileContent)
  `)

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

type stringMap map[string]string
