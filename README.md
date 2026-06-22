# TP1 - Dockerfile corrigé

## Objectif

Réparer l'image Docker cassée fournie pour le TP1 et appliquer les bonnes pratiques Docker :
- pas de secrets en dur dans l'image
- cache Docker exploité correctement
- container non-root
- image finale légère et fonctionnelle
- fichier `.dockerignore` présent

## Contenu du projet

- `Dockerfile` : build Docker corrigé en multi-stage
- `.dockerignore` : exclusions pour le contexte de build
- `package.json` : dépendances de l'application
- `package-lock.json` : verrouillage des dépendances
- `index.js` : application Node.js
- `tp1-enonce.docx` : énoncé du TP

## Commandes

### Construire l'image

```powershell
cd "C:\Users\evaig\Downloads\SujetTP1\SujetTP1"
docker build -t tp1:corrige .
```

### Vérifier l'image

```powershell
docker images tp1:corrige
```

### Vérifier que le container n'est pas root

```powershell
docker run --rm tp1:corrige whoami
```

Le résultat attendu est `node`.

### Lancer l'application

```powershell
docker run -p 3000:3000 tp1:corrige
```

Puis ouvrir dans le navigateur :

```text
http://localhost:3000
```

## Résultat attendu

- L'application doit être accessible sur `http://localhost:3000`
- Un message envoyé via le formulaire doit être affiché
- Le container doit tourner avec l'utilisateur `node`
- L'image doit être raisonnablement légère (environ 181 MB)

## Points importants

- `package-lock.json` est généré pour garantir la reproductibilité des dépendances
- `.dockerignore` évite d'envoyer des fichiers inutiles dans le contexte de build
- Le Dockerfile utilise un build multi-stage pour réduire la taille finale
- Aucune clé ou secret n'est stockée dans le Dockerfile ou dans l'image

## Remarques

Ce projet est prêt pour le rendu du TP1 : la correction Docker est appliquée et l'application fonctionne correctement.

