package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"os"
	"math/rand"
	"time"
	"strconv"
)

// Structure des données JSON renvoyées par l'API
type Artist struct {
	ID           int      `json:"id"`
	Image        string   `json:"image"`
	Name         string   `json:"name"`
	Members      []string `json:"members"`
	CreationDate int      `json:"creationDate"`
	FirstAlbum   string   `json:"firstAlbum"`
	Locations    string   `json:"locations"`
	ConcertDates string   `json:"concertDates"`
	Relations    string   `json:"relations"`
}

type Location struct {
	ID        int      `json:"id"`
	Locations []string `json:"locations"`
	Date      string   `json:"dates"`
}

type Concert struct {
	City string
	Date string
}

type PageData struct {
	Title    string
	Concerts []Concert
	Image string
	Name string
}

type APIResponse struct {
	Artists   []Artist   `json:"-"`
	Locations []Location `json:"locations"`
}

const artistsAPIURL = "https://groupietrackers.herokuapp.com/api/artists"
const locationsAPIURL = "https://groupietrackers.herokuapp.com/api/locations/"


var artistCache map[string]Artist

func init() {
    artistCache = make(map[string]Artist)
}

// Handler pour récupérer les données des artistes depuis l'API
func artistsHandler(w http.ResponseWriter, r *http.Request) {
	// Code pour récupérer les données des artistes depuis l'API
	response, err := http.Get(artistsAPIURL)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des données des artistes", http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()

	// Vérifier le code de statut de la réponse
	if response.StatusCode != http.StatusOK {
		http.Error(w, "Réponse non valide de l'API des artistes", response.StatusCode)
		return
	}

	// Lire le corps de la réponse et l'afficher pour débogage
	bodyBytes, err := io.ReadAll(response.Body)
	if err != nil {
		http.Error(w, "Erreur lors de la lecture du corps de la réponse", http.StatusInternalServerError)
		return
	}

	// Décode la réponse JSON
	var artists []Artist
	err = json.Unmarshal(bodyBytes, &artists)
	if err != nil {
		http.Error(w, "Erreur lors de la lecture des données JSON", http.StatusInternalServerError)
		return
	}

	for _, artist := range artists {
        artistCache[strconv.Itoa(artist.ID)] = Artist{
            ID:           artist.ID,
            Image:        artist.Image,
            Name:         artist.Name,
            Members:      artist.Members,
            CreationDate: artist.CreationDate,
            FirstAlbum:   artist.FirstAlbum,
            Locations:    artist.Locations,
            ConcertDates: artist.ConcertDates,
            Relations:    artist.Relations,
        }
    }

	// Utilisation d'un template pour générer la page HTML
	tmpl, err := template.ParseFiles("templates/artist.html")
	if err != nil {
		http.Error(w, "Erreur lors de l'ouverture du template", http.StatusInternalServerError)
		return
	}

	// Envoyer la réponse HTML au client
	err = tmpl.Execute(w, artists)
	if err != nil {
		http.Error(w, "Erreur lors de l'écriture de la réponse HTML", http.StatusInternalServerError)
		return
	}
}


func randomDate() string {
	start := time.Date(2019, time.January, 1, 0, 0, 0, 0, time.UTC)
	end := time.Date(2020, time.December, 31, 23, 59, 59, 0, time.UTC)

	randomTime := start.Add(time.Duration(rand.Int63n(end.Unix()-start.Unix())) * time.Second)

	
	return randomTime.Format("02-01-2006")
}

// gestionnaire pour la page des concerts
func concertsHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	apiURL := fmt.Sprintf("%s%s", locationsAPIURL, id)
	response, err := http.Get(apiURL)
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des données des artistes", http.StatusInternalServerError)
		return
	}
	defer response.Body.Close()

	artist, ok := artistCache[id]
    if !ok {
        http.Error(w, "Artiste non trouvé", http.StatusNotFound)
        return
    }

	

	// Vérifier le code de statut de la réponse
	if response.StatusCode != http.StatusOK {
		http.Error(w, "Réponse non valide de l'API des artistes", response.StatusCode)
		return
	}

	// Lire le corps de la réponse et l'afficher pour débogage
	bodyBytes, err := io.ReadAll(response.Body)
	if err != nil {
		http.Error(w, "Erreur lors de la lecture du corps de la réponse", http.StatusInternalServerError)
		return
	}

	// Décode la réponse JSON
	var locations Location
	err = json.Unmarshal(bodyBytes, &locations)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var concerts []Concert
	for _, city := range locations.Locations {
		concerts = append(concerts, Concert{
			City: city,
			Date: randomDate(),
		})
	}

	data := PageData{
		Title:    "Concerts",
		Concerts: concerts,
		Image: artist.Image,
		Name: artist.Name,
	}

	// Utilisation d'un template pour générer la page HTML
	tmpl, err := template.ParseFiles("templates/concerts.html")
	if err != nil {
		http.Error(w, "Erreur lors de l'ouverture du template", http.StatusInternalServerError)
		return
	}

	
	err = tmpl.Execute(w, data)
	if err != nil {
		http.Error(w, "Erreur lors de l'écriture de la réponse HTML", http.StatusInternalServerError)
		return
	}
}

// gestionnaire pour la page des dates
func datesHandler(w http.ResponseWriter, r *http.Request) {
	// récupérer les données des dates depuis l'API
	htmlContent, err := os.ReadFile("templates/dates.html")
	if err != nil {
		http.Error(w, "Erreur lors de la lecture du fichier HTML", http.StatusInternalServerError)
		return
	}

	// Écrire le contenu du fichier HTML dans la réponse HTTP
	w.Header().Set("Content-Type", "text/html")
	w.Write(htmlContent)
}

// gestionnaire pour la page des relations
func relationsHandler(w http.ResponseWriter, r *http.Request) {
	// récupérer les données des relations depuis l'API
	htmlContent, err := os.ReadFile("templates/relations.html")
	if err != nil {
		http.Error(w, "Erreur lors de la lecture du fichier HTML", http.StatusInternalServerError)
		return
	}

	// Écrire le contenu du fichier HTML dans la réponse HTTP
	w.Header().Set("Content-Type", "text/html")
	w.Write(htmlContent)
}
