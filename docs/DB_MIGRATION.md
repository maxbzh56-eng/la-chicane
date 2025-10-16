# 📊 Migration de Base de Données Supabase

## Guide pour exporter/importer votre base de données entre production et local

### 🚀 Prérequis

1. **PostgreSQL client** installé localement (pour `pg_dump` et `psql`)
   ```bash
   # macOS
   brew install postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql-client

   # Fedora
   sudo dnf install postgresql
   ```

2. **Docker** avec Supabase local en cours d'exécution
   ```bash
   make dev
   ```

### 📤 Exporter depuis Supabase Production

1. **Obtenir le mot de passe de votre base de données production**
   - Allez sur [dashboard.supabase.com](https://dashboard.supabase.com)
   - Sélectionnez votre projet
   - Settings → Database → Connection string
   - Copiez le mot de passe

2. **Exécuter le script d'export**
   ```bash
   chmod +x scripts/db-export.sh
   ./scripts/db-export.sh
   ```
   - Entrez le mot de passe quand demandé
   - Le backup sera sauvé dans `backups/supabase_backup_[timestamp].sql`
   - Un lien `backups/latest.sql` pointera vers le dernier export

### 📥 Importer dans Supabase Local

1. **S'assurer que Supabase local est lancé**
   ```bash
   make dev
   # ou
   docker compose --profile dev up
   ```

2. **Importer le backup**
   ```bash
   chmod +x scripts/db-import.sh

   # Importer le dernier backup
   ./scripts/db-import.sh

   # Ou importer un fichier spécifique
   ./scripts/db-import.sh backups/supabase_backup_20240114_120000.sql
   ```

3. **Vérifier l'import**
   - Ouvrez Supabase Studio : http://localhost:54323
   - Ou connectez-vous à la base :
   ```bash
   make supabase-db
   # puis
   \dt
   ```

### 🔧 Commandes Makefile Utiles

```bash
# Accéder à PostgreSQL local
make supabase-db

# Voir les logs Supabase
make supabase-logs

# Réinitialiser la base de données locale
make supabase-reset
```

### 📝 Structure des Exports

Les scripts excluent automatiquement les schémas système :
- `auth` - Géré par Supabase Auth
- `storage` - Géré par Supabase Storage
- `supabase_migrations` - Migrations internes
- `graphql` - Schémas GraphQL
- `realtime` - Configuration temps réel

Seules vos tables et données dans le schéma `public` sont exportées.

### ⚠️ Notes Importantes

1. **Sécurité** : Ne committez jamais les fichiers de backup dans Git
   - Le dossier `backups/` est déjà dans `.gitignore`

2. **Taille des bases** : Pour les grosses bases de données, l'export/import peut prendre du temps

3. **Compatibilité** : Les scripts sont conçus pour fonctionner entre versions similaires de PostgreSQL

### 🐛 Dépannage

#### Erreur "pg_dump: command not found"
→ Installez PostgreSQL client (voir Prérequis)

#### Erreur "supabase-db container not running"
→ Lancez d'abord `make dev`

#### Erreur de connexion à la production
→ Vérifiez :
- Le mot de passe
- Que votre IP est autorisée dans Supabase (Settings → Database → Connection pooling)

#### Import échoue avec erreurs de permissions
→ Normal pour certaines extensions système, vos données sont quand même importées

### 🔄 Workflow Recommandé

1. **Développement initial**
   ```bash
   # 1. Exporter la production
   ./scripts/db-export.sh

   # 2. Importer en local
   ./scripts/db-import.sh

   # 3. Développer avec données réelles
   make dev
   ```

2. **Synchronisation régulière**
   ```bash
   # Créer un backup avant sync
   docker exec supabase-db pg_dump -U postgres postgres > backups/local_backup.sql

   # Importer les nouvelles données de prod
   ./scripts/db-export.sh
   ./scripts/db-import.sh
   ```

3. **Backup local avant modifications importantes**
   ```bash
   docker exec supabase-db pg_dump -U postgres postgres > backups/local_$(date +%Y%m%d).sql
   ```