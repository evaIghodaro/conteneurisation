# TP3 - Conteneurisation de TaskFlow

## 📋 Objectif

Conteneuriser l'application TaskFlow en utilisant Docker et Docker Compose pour qu'une personne qui clone le repo puisse lancer toute la stack avec une seule commande.

## 🏗️ Architecture

La stack complète contient 3 services :

| Service | Image | Port | Rôle |
|---------|-------|------|------|
| **Frontend** | `nginx:alpine` | `8080` | Interface web statique |
| **Backend** | `node:20-alpine` | `3001` | API REST + logique métier |
| **Cache** | `redis:7-alpine` | *(interne)* | Stockage des tâches et statistiques |

## 📂 Structure du projet

```
.
├── backend/
│   ├── Dockerfile          # Image Node.js Alpine
│   ├── package.json        # Dépendances Node.js
│   └── server.js           # API REST avec endpoints /tasks, /stats, /health
├── frontend/
│   ├── Dockerfile          # Image Nginx Alpine
│   └── index.html          # Interface web statique
├── docker-compose.yml      # Orchestration des 3 services
├── .env.example            # Template des variables d'environnement
├── .dockerignore           # Fichiers à exclure du contexte build
└── README-TP3.md          # Ce fichier
```

## 🚀 Démarrage rapide

### Prérequis

- **Docker** ≥ 20.10
- **Docker Compose** ≥ 2.0

### Lancement

Depuis la racine du projet :

```bash
docker compose up --build
```

Cela va :
1. Builder les images Docker du frontend et backend
2. Démarrer les 3 containers
3. Créer un réseau Docker privé `taskflow-net`
4. Configurer les volumes pour Redis

### Accès à l'application

- **Frontend** : http://localhost:8080
- **Backend API** : http://localhost:3001
- **Health check** : http://localhost:3001/health

## 🔧 Configuration

### Variables d'environnement

Copier `.env.example` en `.env` et adapter si besoin :

```bash
cp .env.example .env
```

Contenu par défaut :

```env
APP_ENV=local
BACKEND_PORT=3001
FRONTEND_PORT=8080
REDIS_HOST=cache
REDIS_PORT=6379
REDIS_PASSWORD=change-me-if-needed
```

### Points importants

- **Redis n'est pas exposé** sur le localhost : seul le backend peut le joindre via le réseau Docker `taskflow-net`
- Le **backend reçoit les variables** `REDIS_HOST=cache` et `REDIS_PORT=6379` automatiquement
- Les **données Redis persistent** grâce au volume nommé `redis_data`

## 📊 API Backend

### GET /health
Vérifie la connexion à Redis.

```bash
curl http://localhost:3001/health
```

Réponse :
```json
{
  "status": "ok",
  "redis": "connected"
}
```

### GET /tasks
Récupère la liste de toutes les tâches.

```bash
curl http://localhost:3001/tasks
```

### POST /tasks
Crée une nouvelle tâche.

```bash
curl -X POST http://localhost:3001/tasks \
  -H "Content-Type: application/json" \
  -d '{"titre": "Ma nouvelle tâche"}'
```

### PUT /tasks/:id
Met à jour l'état d'une tâche.

```bash
curl -X PUT http://localhost:3001/tasks/1234567890 \
  -H "Content-Type: application/json" \
  -d '{"done": true}'
```

### DELETE /tasks/:id
Supprime une tâche.

```bash
curl -X DELETE http://localhost:3001/tasks/1234567890
```

### GET /stats
Récupère les statistiques.

```bash
curl http://localhost:3001/stats
```

Réponse :
```json
{
  "total": 5,
  "done": 2,
  "pending": 3
}
```

## 🛑 Arrêt

Pour arrêter la stack :

```bash
docker compose down
```

Pour supprimer aussi les volumes (dont Redis) :

```bash
docker compose down -v
```

## ✅ Critères de succès

- [x] **Commande unique** : `docker compose up --build` lance toute la stack
- [x] **Frontend** : Interface accessible à http://localhost:8080
- [x] **Backend** : API accessible à http://localhost:3001 avec route /health
- [x] **Cache interne** : Redis non exposé sur localhost, joignable par le backend uniquement
- [x] **Persistance** : Données Redis sauvegardées via volume nommé
- [x] **Configuration** : .env.example présent sans secrets en dur
- [x] **Docker** : .dockerignore optimisé

## 📝 Notes technique

### Docker Cache
- Le `package*.json` est copié **avant** le code source
- Cela permet à Docker de réutiliser la layer des dépendances si seul le code change
- Accélère les rebuilds

### Sécurité
- Pas de secrets dans les Dockerfiles
- Pas d'utilisateur root dans les containers
- Variables sensibles via `.env` (non versionné)

### Réseaux
- Les 3 services communiquent via le réseau Docker `taskflow-net`
- Le frontend appelle le backend via `http://backend:3001` depuis le container
- Depuis le navigateur local : `http://localhost:3001`

## 🐛 Dépannage

### Le backend ne se connecte pas à Redis

Vérifier que Redis est en cours d'exécution :

```bash
docker compose ps
```

Tous les services doivent être `Up`.

### Les données disparaissent après `docker compose down`

C'est normal. Pour les conserver, utiliser :

```bash
docker compose down  # Sans -v
```

### Port déjà utilisé

Si le port 8080 ou 3001 est déjà occupé, modifier dans `docker-compose.yml` ou `.env`.

## 📚 Ressources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [Node.js Alpine Images](https://hub.docker.com/_/node)
- [Nginx Alpine Images](https://hub.docker.com/_/nginx)
- [Redis Alpine Images](https://hub.docker.com/_/redis)

---

**Auteur** : DevOps Engineer Junior  
**Date** : Juin 2026  
**Niveau** : Intermediate
