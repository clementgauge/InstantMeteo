# 🚀 Guide Déploiement GitHub ➔ Cloudflare Workers pour Instant Météo

Ce guide permet d'avoir **exactement la même forme, le même design, les mêmes cartes OpenStreetMap et les mêmes fonctionnalités** sur :
- 👉 **AI Studio** : `https://instantmeteo-fr.ai.studio/`
- 👉 **Cloudflare Workers** : `https://instantmeteo.instantmeteofr.workers.dev/`

---

## 🌟 Pourquoi le site était différent auparavant ?
Auparavant, le Worker Cloudflare n'était configuré que pour répondre aux requêtes de base de données JSON (`/api/health`, `/api/leaderboard`), et ne distribuait pas le code frontend (`dist/`).

Désormais, grâce à la configuration **Cloudflare Workers Static Assets (`[assets]`)** et au support `env.ASSETS` :
1. **Même Design & CSS** : Tout le bundle Tailwind CSS compilé, les graphiques Recharts, les thèmes clair/sombre et les polices sont servis directement par le CDN mondial de Cloudflare.
2. **Mêmes Cartes OpenStreetMap** : Tous les fonds cartographiques utilisent les serveurs OpenStreetMap officiels avec tolérance aux pannes.
3. **Navigation SPA sans 404** : Toutes les pages (`/radar`, `/vigilances`, `/direct`, `/nuages`, `/14-jours`, `/sports`, etc.) sont pré-rendues avec leurs balises SEO canoniques et s'affichent instantanément.
4. **Base de données SQL D1 connectée** : Le classement des joueurs, les signalements communautaires et les profils sont synchronisés en temps réel.

---

## ⚡ Option 1 : Déploiement Automatique via GitHub Actions (Recommandé)

Le fichier `.github/workflows/deploy.yml` a été créé à la racine du projet.

### Étape 1 : Récupérer votre Token Cloudflare
1. Rendez-vous sur votre compte [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens).
2. Cliquez sur **« Create Token »** ➔ Utilisez le modèle **« Edit Cloudflare Workers »**.
3. Copiez le token généré.
4. Récupérez aussi votre **Account ID** (visible sur la page d'accueil de votre compte Cloudflare dans la barre latérale droite).

### Étape 2 : Ajouter les secrets dans GitHub
1. Sur votre dépôt GitHub, allez dans **Settings** ➔ **Secrets and variables** ➔ **Actions**.
2. Cliquez sur **New repository secret** et ajoutez :
   - `CLOUDFLARE_API_TOKEN` : *(votre token API)*
   - `CLOUDFLARE_ACCOUNT_ID` : *(votre ID de compte Cloudflare)*

### Étape 3 : Pousser sur GitHub
Dès que vous poussez votre code (`git push origin main`), GitHub Actions :
1. Installe les dépendances.
2. Compile le frontend complet (`npm run build`).
3. Déploie l'application complète sur `https://instantmeteo.instantmeteofr.workers.dev/`.

---

## 💻 Option 2 : Déploiement Manuel depuis votre Machine

Si vous préférez déployer depuis votre terminal local :

```bash
# 1. Installer les dépendances si nécessaire
npm install

# 2. Compiler l'application et générer les pages statiques
npm run build

# 3. Déployer directement sur Cloudflare Workers
npx wrangler deploy
```

La commande déploie à la fois :
- Le dossier `./dist` (tous les assets web, styles, scripts, images).
- Le script `cloudflare-d1/src/index.ts` (API et base de données D1).
- Le nom de service `instantmeteo` associé à votre domaine `instantmeteofr.workers.dev`.

---

## 🔍 Vérification après Déploiement
- **Accueil** : `https://instantmeteo.instantmeteofr.workers.dev/` (Design identique à AI Studio)
- **Radar Pluie** : `https://instantmeteo.instantmeteofr.workers.dev/radar`
- **Vigilances** : `https://instantmeteo.instantmeteofr.workers.dev/vigilances`
- **Santé de l'API D1** : `https://instantmeteo.instantmeteofr.workers.dev/api/health`
- **Clé Carte Météo** : `https://instantmeteo.instantmeteofr.workers.dev/api/carte-meteo/key`
