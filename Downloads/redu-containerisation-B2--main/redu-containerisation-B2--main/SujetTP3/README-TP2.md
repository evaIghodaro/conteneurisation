# TP2 - Docker Compose : Stack multi-services

## 📋 Objectif

Écrire un fichier `docker-compose.yml` pour lancer ensemble une application découpée en 3 services : un frontend Nginx, une API Node.js et une base de données PostgreSQL. Persister les données PostgreSQL et ajouter Adminer pour administrer la base.

## 🏗️ Architecture

La stack contient 4 services :

| Service | Image | Port | Rôle |
|---------|-------|------|------|
| **Frontend** | `nginx:alpine` | `8080` | Interface web statique |
| **API** | `node:alpine` | `3000` | API Node.js REST |
| **Database** | `postgres:latest` | *(interne)* | Base de données PostgreSQL |
| **Adminer** | `adminer:latest` | `8081` | Administrer la base de données |

## 📂 Structure du projet

```
.
├── api/
│   ├── Dockerfile          # Image Node.js Alpine
│   ├── package.json        # Dépendances Node.js
│   └── index.js            # API REST
├── frontend/
│   ├── Dockerfile          # Image Nginx Alpine
│   └── index.html          # Interface web statique
├── docker-compose.yml      # Orchestration des 4 services
├── .env                    # Variables d'environnement (non versionné)
└── README-TP2.md          # Ce fichier
```

## 🚀 Démarrage rapide

### Prérequis

- **Docker** ≥ 20.10
- **Docker Compose** ≥ 2.0

### Configuration initiale

1. Créer un fichier `.env` à la racine (basé sur `.env.example` si présent) :

```bash
DB_USER=tp2user
DB_PASSWORD=mon_mot_de_passe_securise
DB_NAME=tp2db
```

2. Lancer la stack :

```bash
docker compose up --build
```

### Accès à l'application

- **Frontend** : http://localhost:8080
- **API** : http://localhost:3000
- **Adminer** : http://localhost:8081

## 🔧 Configuration

### Variables d'environnement

Les valeurs sensibles sont passées via `.env` (fichier local non versionné) :

```env
DB_HOST=database
DB_PORT=5432
DB_NAME=tp2db
DB_USER=tp2user
DB_PASSWORD=change-moi
PORT=3000
```

### Points importants

- **Database n'est pas exposée** sur le localhost : seule l'API peut la joindre via le réseau Docker interne `tp2-network`
- L'**API communique avec database** via le nom de service `database`
- Les **données PostgreSQL persistent** grâce au volume nommé `db_data`
- **Adminer peut accéder à la base** via le réseau Docker interne

## 💾 Persistance des données

Les données PostgreSQL sont sauvegardées dans un volume nommé `db_data`. Après un `docker compose down`, les données survivent.

Pour vérifier :

```bash
# Ajouter 3 messages depuis le frontend
docker compose down
docker compose up -d
# Ouvrir http://localhost:8080
# Les messages sont toujours là
```

Pour supprimer définitivement les données :

```bash
docker compose down -v  # -v supprime aussi les volumes
```

## 🗄️ Adminer - Administrer la base

### Accès

Ouvrir http://localhost:8081

### Connexion

- **Système** : PostgreSQL
- **Serveur** : `database`
- **Utilisateur** : valeur de `DB_USER` (ex: `tp2user`)
- **Mot de passe** : valeur de `DB_PASSWORD`
- **Base** : valeur de `DB_NAME` (ex: `tp2db`)

### Actions possibles

- Visualiser les tables
- Exécuter des requêtes SQL
- Modifier les données directement
- Exporter/importer les données

## 📊 API Backend

L'API Node.js expose les endpoints suivants :

### GET /health
Vérifie que l'API fonctionne.

```bash
curl http://localhost:3000/health
```

Réponse :
```json
{
  "status": "ok"
}
```

### GET /messages
Récupère tous les messages stockés.

### POST /messages
Crée un nouveau message.

```bash
curl -X POST http://localhost:3000/messages \
  -H "Content-Type: application/json" \
  -d '{"texte": "Mon message"}'
```

## 🛑 Arrêt

Pour arrêter la stack sans supprimer les volumes :

```bash
docker compose down
```

Pour supprimer aussi les volumes :

```bash
docker compose down -v
```

## ✅ Critères de succès

- [x] **Frontend accessible** : http://localhost:8080 affiche la page
- [x] **API accessible** : http://localhost:3000/health répond `{"status":"ok"}`
- [x] **Communication API ↔ BDD** : Envoyer un message depuis le frontend → il s'affiche
- [x] **BDD non exposée** : localhost:5432 ne répond pas (aucun port publié)
- [x] **Adminer accessible** : http://localhost:8081 affiche l'interface
- [x] **Adminer connecté à la BDD** : Voir la table messages
- [x] **Données persistantes** : Messages survivent à `docker compose down` + `docker compose up -d`
- [x] **Pas de secrets en dur** : `grep password docker-compose.yml` ne montre que des variables

## 🐛 Dépannage

### L'API ne se connecte pas à la base

1. Vérifier que tous les services sont en cours d'exécution :

```bash
docker compose ps
```

Tous doivent être `Up`.

2. Vérifier que l'API utilise le bon `DB_HOST` (doit être `database`, le nom du service)

3. Vérifier que `.env` a les bonnes valeurs

### Adminer n'arrive pas à se connecter

- **Serveur** doit être `database` (pas localhost)
- Les identifiants doivent correspondre à `.env`
- La base `tp2db` doit avoir été créée (PostgreSQL la crée automatiquement)

### Port déjà utilisé

Si 8080, 3000 ou 8081 est occupé, modifier dans `docker-compose.yml` :

```yaml
ports:
  - "8082:80"  # au lieu de 8080:80
```

### Les secrets apparaissent dans le fichier

❌ Mauvais :
```yaml
environment:
  DB_PASSWORD: "mon_password"
```

✅ Bon :
```yaml
environment:
  DB_PASSWORD: ${DB_PASSWORD}
```

Et mettre la vraie valeur dans `.env`

## 📚 Concepts Docker Compose

### depends_on
Démarre les services dans le bon ordre, mais **n'attend pas** que le service soit prêt.

```yaml
depends_on:
  - database
```

Si l'API plante au démarrage, utiliser `restart: on-failure`

### Volumes nommés
Persiste les données même après `docker compose down`.

```yaml
volumes:
  db_data:
    
services:
  database:
    volumes:
      - db_data:/var/lib/postgresql/data
```

### Réseaux
Les services peuvent se joindre par leur nom via le réseau Docker.

```yaml
networks:
  - tp2-network
  
services:
  api:
    networks:
      - tp2-network
  database:
    networks:
      - tp2-network
```

### Variables d'environnement
Injectées dans le container.

```yaml
environment:
  DB_HOST: ${DB_HOST}
  DB_PASSWORD: ${DB_PASSWORD}
```

Les variables viennent du fichier `.env` local.

## 📚 Ressources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Nginx Alpine Images](https://hub.docker.com/_/nginx)
- [Adminer Documentation](https://www.adminer.org)
- [Node.js Alpine Images](https://hub.docker.com/_/node)

---

**Auteur** : DevOps Engineer Junior  
**Date** : Juin 2026  
**Niveau** : Intermediate
