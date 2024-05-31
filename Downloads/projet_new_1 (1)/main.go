package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()
	staticDir := "/static/"
	router.PathPrefix(staticDir).Handler(http.StripPrefix(staticDir, http.FileServer(http.Dir("static"))))

	router.HandleFunc("/", artistsHandler)
	router.HandleFunc("/concerts", concertsHandler)
	router.HandleFunc("/dates", datesHandler)
	router.HandleFunc("/relations", relationsHandler)

	fmt.Println("Serveur démarré sur http://localhost:8080")

	http.Handle("/", router)
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Erreur lors du démarrage du serveur:", err)
	}
}
