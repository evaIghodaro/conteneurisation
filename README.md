# TP2 - Docker Compose

Ce projet montre un TP complet Docker Compose avec :

- `frontend` : interface web statique servie par Nginx
- `api` : API Node.js qui stocke des messages dans PostgreSQL
- `db` : base de données PostgreSQL

## Structure

- `api/` contient l'API Node.js
- `frontend/` contient le HTML et la configuration Nginx
- `docker-compose.yml` assemble les 3 services

## Exécution

Depuis le dossier racine du projet (`SujetTP2/SujetTP2`) :

```bash
docker compose up --build
```

Puis ouvrir :

- `http://localhost:8080` pour l'application web

## API disponibles

- `GET /messages` : liste tous les messages
- `POST /messages` : ajoute un message
- `GET /health` : vérifie que l'API tourne

## Notes

- Les messages sont stockés dans PostgreSQL.
- Le frontend envoie les requêtes à `/api/messages` via le proxy Nginx.
