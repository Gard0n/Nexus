# Nexus

> Ton journal culturel cross-média — Films, séries, livres, jeux, musique

Nexus est une application web pour suivre et organiser toutes les œuvres culturelles que tu consommes. Inspiré de Letterboxd et SensCritique, mais avec une vision unifiée pour tous les types de médias.

## ✨ Fonctionnalités

### 🎬 Multi-média
- Films & séries (via TMDB)
- Livres (via Open Library)
- Jeux vidéo (via RAWG)
- Musique (via MusicBrainz)

### 📖 Journal chronologique
- Timeline de toutes tes consommations culturelles
- Notes sur 10, critiques personnelles, tags
- Groupement par mois
- Marquage revisite/relecture

### ❤️ Wishlist
- Garde une trace de ce que tu veux découvrir
- Filtres par type de média
- Transfert facile vers le journal

### 🧬 ADN Culturel
- Statistiques détaillées calculées à partir de ton journal
- Répartition par type de média (donut chart)
- Top genres (radar chart)
- Activité mensuelle (bar chart)
- Note moyenne, type favori, mois le plus actif

### 🔍 Recherche unifiée
- Recherche en temps réel dans toutes les bases de données
- Résultats groupés par onglets
- Ajout rapide au journal ou à la wishlist

## 🚀 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **State:** React hooks + Context
- **Charts:** Recharts
- **Backend:** Supabase (Auth + PostgreSQL) ou localStorage (mode dev)
- **APIs:** TMDB, Open Library, RAWG, MusicBrainz

## 🛠️ Installation

### Prérequis
- Node.js 18+
- npm ou yarn

### Setup

```bash
# Clone le repo
git clone https://github.com/Gard0n/Nexus.git
cd Nexus

# Install les dépendances
npm install

# Configure les variables d'environnement
cp .env.example .env
# Édite .env avec tes clés API
```

### Variables d'environnement

```bash
# Mode dev (bypass auth)
VITE_DEV_MODE=true

# Supabase (optionnel en mode dev)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# TMDB API (requis pour films/séries)
VITE_TMDB_API_KEY=your-tmdb-key
VITE_TMDB_LANGUAGE=fr-FR

# RAWG API (requis pour jeux vidéo)
VITE_RAWG_API_KEY=your-rawg-key
```

### Obtenir les clés API

1. **TMDB (Films/Séries)** : [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) - Gratuit
2. **RAWG (Jeux)** : [rawg.io/apidocs](https://rawg.io/apidocs) - Gratuit jusqu'à 100k MAU
3. **Open Library & MusicBrainz** : Pas de clé requise

### Lancer l'app

```bash
npm run dev
```

L'app sera disponible sur `http://localhost:5173`

## 📦 Build

```bash
npm run build
npm run preview  # Pour tester le build
```

## 🗄️ Persistence

En **mode dev** (`VITE_DEV_MODE=true`), les données sont stockées dans **localStorage** :
- `nexus_journal` : Entrées du journal
- `nexus_wishlist` : Items de la wishlist

Pour une **utilisation en production**, configure **Supabase** :
1. Crée un projet sur [supabase.com](https://supabase.com)
2. Exécute le schema SQL disponible dans [`supabase/schema.sql`](supabase/schema.sql)
3. Configure les variables `VITE_SUPABASE_*` dans `.env`
4. Désactive le mode dev : `VITE_DEV_MODE=false`

## 🎨 Features à venir

- [ ] Export JSON/CSV
- [ ] Filtres avancés sur le journal
- [ ] Recherche par genre
- [ ] Mode sombre/clair personnalisable
- [ ] Connexions cross-média (film → livre → BO)
- [ ] Parcours thématiques
- [ ] Découverte par humeur
- [ ] Fonctionnalités sociales (profils publics, follow)

## 📝 License

MIT

## 🙏 Crédits

- Données films/séries : [The Movie Database (TMDB)](https://www.themoviedb.org/)
- Données livres : [Open Library](https://openlibrary.org/)
- Données jeux : [RAWG](https://rawg.io/)
- Données musique : [MusicBrainz](https://musicbrainz.org/) + [Cover Art Archive](https://coverartarchive.org/)

---

Made with ❤️ by [Mathieu Jardin](https://github.com/Gard0n)
