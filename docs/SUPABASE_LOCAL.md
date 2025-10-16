# 🚀 Supabase Local avec Docker

## Configuration complète de Supabase en local

Ce projet inclut une instance Supabase complète qui tourne localement dans Docker, avec :
- PostgreSQL 15
- Authentification (GoTrue)
- API REST (PostgREST)
- Temps réel (Realtime)
- Stockage (Storage)
- Studio (Interface d'administration)
- MailHog pour capturer les emails

## 🎯 Démarrage rapide

1. **Copier les variables d'environnement pour le local :**
```bash
cp .env.local.example .env.local
```

2. **Lancer tous les services :**
```bash
make dev
```

3. **Accéder aux services :**
- 🎨 **Supabase Studio** : http://localhost:54323
- 🔌 **API Supabase** : http://localhost:54321
- 📧 **MailHog (emails)** : http://localhost:8025
- 🗄️ **PostgreSQL** : localhost:54322 (user: postgres, password: postgres)
- 🚀 **Votre app Next.js** : http://localhost:3000

## 📝 Variables d'environnement

Les variables pour Supabase local sont déjà configurées dans `.env.local.example` :

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔧 Commandes utiles

```bash
# Voir les logs de tous les services
docker compose --profile dev logs -f

# Voir les logs d'un service spécifique
docker compose logs -f supabase-db
docker compose logs -f supabase-auth
docker compose logs -f supabase-studio

# Accéder à la base de données
docker compose exec supabase-db psql -U postgres

# Arrêter tous les services
make stop

# Nettoyer tout (attention, supprime les données !)
make clean
```

## 📧 Authentification par email

Avec cette configuration, les emails d'authentification Supabase sont automatiquement capturés par MailHog :

1. Quand un utilisateur demande un lien de connexion
2. L'email est envoyé à MailHog (pas vraiment envoyé)
3. Ouvrez http://localhost:8025 pour voir l'email
4. Cliquez sur le lien dans l'email pour vous connecter

## 🗄️ Base de données

### Connexion avec un client SQL

- **Host** : localhost
- **Port** : 54322
- **Database** : postgres
- **Username** : postgres
- **Password** : postgres

### Connexion avec psql
```bash
docker compose exec supabase-db psql -U postgres
```

## 🎨 Supabase Studio

L'interface d'administration est disponible sur http://localhost:54323

Vous pouvez y :
- Gérer vos tables
- Voir et modifier les données
- Gérer l'authentification
- Configurer les politiques RLS
- Exécuter des requêtes SQL

## 🔐 Sécurité

⚠️ **IMPORTANT** : Les clés JWT utilisées ici sont des clés de développement publiques.
**NE JAMAIS** les utiliser en production !

Pour la production, utilisez vos propres clés Supabase Cloud.

## 🐛 Dépannage

### Les services ne démarrent pas
```bash
# Vérifier les logs
docker compose --profile dev logs

# Redémarrer tout
make down
make dev
```

### Erreur de connexion à la base de données
```bash
# Vérifier que PostgreSQL est bien lancé
docker compose ps supabase-db

# Voir les logs de PostgreSQL
docker compose logs supabase-db
```

### Les emails ne sont pas reçus
- Vérifiez que MailHog est lancé : http://localhost:8025
- Vérifiez les logs d'auth : `docker compose logs supabase-auth`

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js App   │ Port 3000
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Kong Gateway  │ Port 54321 (API)
└────────┬────────┘
         │
    ┌────┴────┬──────────┬───────────┬──────────┐
    ▼         ▼          ▼           ▼          ▼
┌────────┐┌────────┐┌──────────┐┌─────────┐┌────────┐
│  Auth  ││  REST  ││ Realtime ││ Storage ││ Studio │
└────────┘└────────┘└──────────┘└─────────┘└────────┘
    │         │          │           │          │
    └─────────┴──────────┴───────────┴──────────┤
                         ▼
                  ┌──────────┐
                  │PostgreSQL│ Port 54322
                  └──────────┘
```

## 📚 En savoir plus

- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Self-Hosting](https://supabase.com/docs/guides/hosting/overview)