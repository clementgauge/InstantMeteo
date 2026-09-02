# 🚀 Guide de Déploiement : Cloudflare D1 + Workers pour Instant Météo

Ce dossier contient l'API serverless haute performance connectée à votre base de données SQL **Cloudflare D1**.
Elle permet de synchroniser le **classement mondial des joueurs**, les **points**, les **flammes** et la **carte collaborative des signalements météo**.

---

## 📋 Prérequis (3 minutes)

1. Avoir un compte gratuit sur [Cloudflare](https://dash.cloudflare.com)
2. Avoir [Node.js](https://nodejs.org) installé sur votre machine.

---

## 🛠️ Étapes de déploiement

### Étape 1 : Se connecter à Cloudflare
Ouvrez votre terminal dans le dossier `cloudflare-d1` :
```bash
cd cloudflare-d1
npx wrangler login
```
*Une fenêtre de navigateur s'ouvre pour autoriser l'accès.*

---

### Étape 2 : Créer la base de données Cloudflare D1
Exécutez la commande suivante :
```bash
npx wrangler d1 create meteo-competitive-db
```
Le terminal affichera un bloc comme celui-ci :
```toml
[[d1_databases]]
binding = "DB"
database_name = "meteo-competitive-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Copiez votre `database_id` et collez-le dans le fichier `wrangler.toml` :
```toml
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

---

### Étape 3 : Initialiser les tables SQL (Migration)
Appliquez le fichier `schema.sql` sur votre base D1 :
```bash
npx wrangler d1 execute meteo-competitive-db --remote --file=./schema.sql
```
*Vos tables `players` et `community_reports` ainsi que les données d'exemples sont créées immédiatement.*

---

### Étape 4 : Déployer le Worker
Lancez le déploiement sur le réseau mondial Cloudflare :
```bash
npx wrangler deploy
```
Le terminal vous donnera votre URL de production, par exemple :
👉 `https://instant-meteo-d1-api.<votre-compte>.workers.dev`

---

### Étape 5 : Connecter l'application Instant Météo
Deux possibilités :
1. **Dans l'application** : Rendez-vous dans l'onglet **« 🏆 Défis & Classement »**, cliquez sur **« 📡 Configuration Cloudflare D1 »**, collez l'URL de votre Worker et cliquez sur **« Tester & Activer »**.
2. **Via variable d'environnement** : Renseignez `VITE_D1_API_URL="https://instant-meteo-d1-api.<votre-compte>.workers.dev"` dans votre fichier `.env`.

---

## 🧪 Tester l'API dans le navigateur
- **Santé & Test D1** : `https://<votre-url>/api/health`
- **Classement mondial** : `https://<votre-url>/api/leaderboard`
- **Signalements météo** : `https://<votre-url>/api/reports`
