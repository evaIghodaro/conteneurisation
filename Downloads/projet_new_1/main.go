package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

// Importation directe de gorilla/mux
var router = mux.NewRouter()

func main() {
	staticDir := "/static/"
	router.PathPrefix(staticDir).Handler(http.StripPrefix(staticDir, http.FileServer(http.Dir("static"))))

	router.HandleFunc("/", artistsHandler).Methods("GET")
	router.HandleFunc("/concerts", concertsHandler).Methods("GET")
	router.HandleFunc("/dates", datesHandler).Methods("GET")
	router.HandleFunc("/relations", relationsHandler).Methods("GET")

	fmt.Println("Serveur démarré sur http://localhost:8080")

	http.Handle("/", router)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Erreur lors du démarrage du serveur:", err)
	}
}
