.PHONY: help build dev prod stop down logs shell clean setup

# Variables
DOCKER_COMPOSE = docker compose
APP_CONTAINER = app
DEV_CONTAINER = app-dev

# Couleurs pour l'affichage
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

help: ## Afficher l'aide
	@echo "$(GREEN)🏎️  La Chicane - Commandes Docker$(NC)"
	@echo ""
	@echo "$(YELLOW)Commandes disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

setup: ## Configuration initiale du projet
	@echo "$(YELLOW)📋 Configuration initiale...$(NC)"
	@if [ ! -f .env.local ]; then \
		cp .env.local.example .env.local; \
		echo "$(GREEN)✅ Fichier .env.local créé avec configuration Supabase local$(NC)"; \
		echo "$(YELLOW)📝 Pour utiliser Supabase cloud, modifiez .env.local$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  Le fichier .env.local existe déjà$(NC)"; \
	fi

build: ## Construire l'image Docker de production
	@echo "$(YELLOW)🔨 Construction de l'image de production...$(NC)"
	$(DOCKER_COMPOSE) build $(APP_CONTAINER)

build-dev: ## Construire l'image Docker de développement
	@echo "$(YELLOW)🔨 Construction de l'image de développement...$(NC)"
	$(DOCKER_COMPOSE) build $(DEV_CONTAINER)

dev: ## Lancer en mode développement avec Supabase local et MailHog
	@echo "$(GREEN)🚀 Lancement en mode développement avec Supabase local...$(NC)"
	@echo "$(YELLOW)🎨 Supabase Studio : http://localhost:54323$(NC)"
	@echo "$(YELLOW)📧 MailHog : http://localhost:8025$(NC)"
	@echo "$(YELLOW)🔌 API Supabase : http://localhost:54321$(NC)"
	$(DOCKER_COMPOSE) --profile dev up

prod: ## Lancer en mode production
	@echo "$(GREEN)🚀 Lancement en mode production...$(NC)"
	$(DOCKER_COMPOSE) up $(APP_CONTAINER)

prod-d: ## Lancer en mode production en arrière-plan
	@echo "$(GREEN)🚀 Lancement en mode production (détaché)...$(NC)"
	$(DOCKER_COMPOSE) up -d $(APP_CONTAINER)

stop: ## Arrêter les conteneurs
	@echo "$(YELLOW)⏹️  Arrêt des conteneurs...$(NC)"
	$(DOCKER_COMPOSE) stop

down: ## Arrêter et supprimer les conteneurs
	@echo "$(RED)🗑️  Suppression des conteneurs...$(NC)"
	$(DOCKER_COMPOSE) down

down-v: ## Arrêter et supprimer les conteneurs avec les volumes
	@echo "$(RED)🗑️  Suppression des conteneurs et volumes...$(NC)"
	$(DOCKER_COMPOSE) down -v

logs: ## Afficher les logs de l'application
	$(DOCKER_COMPOSE) logs -f $(APP_CONTAINER)

logs-dev: ## Afficher les logs du mode développement
	$(DOCKER_COMPOSE) logs -f $(DEV_CONTAINER)

logs-mail: ## Afficher les logs de MailHog
	$(DOCKER_COMPOSE) logs -f mailhog

shell: ## Ouvrir un shell dans le conteneur de production
	@echo "$(YELLOW)🐚 Ouverture du shell...$(NC)"
	$(DOCKER_COMPOSE) exec $(APP_CONTAINER) sh

shell-dev: ## Ouvrir un shell dans le conteneur de développement
	@echo "$(YELLOW)🐚 Ouverture du shell de développement...$(NC)"
	$(DOCKER_COMPOSE) exec $(DEV_CONTAINER) sh

restart: ## Redémarrer les conteneurs
	@echo "$(YELLOW)🔄 Redémarrage...$(NC)"
	$(MAKE) stop
	$(MAKE) prod

restart-dev: ## Redémarrer en mode développement
	@echo "$(YELLOW)🔄 Redémarrage en développement...$(NC)"
	$(MAKE) stop
	$(MAKE) dev

clean: ## Nettoyer les images et conteneurs Docker
	@echo "$(RED)🧹 Nettoyage complet...$(NC)"
	$(DOCKER_COMPOSE) down -v
	docker system prune -af --volumes

status: ## Afficher le statut des conteneurs
	@echo "$(YELLOW)📊 Statut des conteneurs:$(NC)"
	$(DOCKER_COMPOSE) ps

supabase-db: ## Accéder à PostgreSQL Supabase
	@echo "$(YELLOW)🗄️  Connexion à la base de données Supabase...$(NC)"
	$(DOCKER_COMPOSE) exec supabase-db psql -U postgres

supabase-logs: ## Afficher les logs de tous les services Supabase
	$(DOCKER_COMPOSE) logs -f supabase-db supabase-auth supabase-rest supabase-realtime supabase-storage

supabase-reset: ## Réinitialiser la base de données Supabase (ATTENTION: perte de données!)
	@echo "$(RED)⚠️  ATTENTION: Ceci va supprimer toutes les données Supabase!$(NC)"
	@echo "Appuyez sur Ctrl+C pour annuler, ou Entrée pour continuer..."
	@read confirm
	$(DOCKER_COMPOSE) down -v supabase-db
	$(DOCKER_COMPOSE) --profile dev up -d supabase-db
	@echo "$(GREEN)✅ Base de données Supabase réinitialisée$(NC)"

npm: ## Exécuter une commande npm dans le conteneur (usage: make npm cmd="install package")
	$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm $(cmd)

npm-dev: ## Exécuter une commande npm dans le conteneur dev (usage: make npm-dev cmd="install package")
	$(DOCKER_COMPOSE) exec $(DEV_CONTAINER) npm $(cmd)
