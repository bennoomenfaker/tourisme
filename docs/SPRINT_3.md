# Sprint 3 — CI/CD & Redis Cache

**Date :** 28 Juin 2026

---

## Sommaire

1. [CI/CD — GitHub Actions](#1-cicd--github-actions)
2. [Redis Cache](#2-redis-cache)
3. [Fichiers modifiés/créés](#3-fichiers-modifiécréés)
4. [Commandes utiles](#4-commandes-utiles)
5. [Déploiement Redis en local](#5-déploiement-redis-en-local)

---

## 1. CI/CD — GitHub Actions

### Pipeline CI (vérification automatique)

```yaml
# .github/workflows/ci.yml
Déclencheurs : push (main, dev), pull_request (main)
Étapes :
  1. Lint backend (ESLint)
  2. Build backend (tsc)
  3. Tests backend (jest)
  4. Lint frontend (ESLint)
  5. Build frontend (next build)
```

### Pipeline CD (déploiement automatique)

```yaml
# .github/workflows/deploy.yml
Déclencheur : push sur main
Étapes :
  1. Tests backend
  2. Build images Docker
  3. Déploiement sur le serveur via SSH
  4. docker compose up -d
```

### Structure des fichiers

```
.github/
  workflows/
    ci.yml        # Vérification à chaque push/PR
    deploy.yml    # Déploiement automatique sur main
```

---

## 2. Redis Cache

### Architecture

```
Client ──→ NestJS API ──→ Redis (cache) ──→ PostgreSQL
                              │
                          Cache hit  → retour immédiat
                          Cache miss → requête DB → stocke dans Redis
```

### Service Redis

Module custom `RedisModule` avec `ioredis` :

```
src/redis/
  redis.module.ts    # Module NestJS (global)
  redis.service.ts   # Wrapper get/set/del/delByPattern
```

API du service :

| Méthode | Description |
|---------|-------------|
| `get<T>(key)` | Récupère une valeur typée |
| `set<T>(key, value, ttl?)` | Stocke avec expiration (défaut: 300s) |
| `del(key)` | Supprime une clé |
| `delByPattern(pattern)` | Supprime par pattern (ex: `offer:*`) |

### Stratégie de cache

| Endpoint | Clé Redis | TTL | Invalidation |
|----------|-----------|-----|-------------|
| `GET /offers` | `offer:list:all` | 300s | create/update/delete offer |
| `GET /offers/:id` | `offer:detail:{id}` | 300s | update/delete offer |
| `GET /offers/popular-locations` | `offer:popular-locations` | 600s | create/update/delete offer |
| `GET /circuits` | `circuit:list:all` | 300s | create/update/delete circuit |
| `GET /circuits/:id` | `circuit:detail:{id}` | 300s | update/delete circuit |

### Configuration

```env
# .env.dev / .env.production
REDIS_HOST=localhost      # dev: localhost, prod: redis
REDIS_PORT=6379
REDIS_TTL=300             # TTL par défaut en secondes
```

### Docker Compose

```yaml
redis:
  image: redis:7-alpine
  restart: unless-stopped
  networks:
    - tourisme_net
```

### Installation

```bash
cd backend
npm install ioredis
```

### Cache Invalidation Pattern

Les mutations (create/update/delete) invalident les caches concernés :

```
OfferService.create()     → delByPattern("offer:*")
OfferService.update()     → delByPattern("offer:*")
OfferService.remove()     → delByPattern("offer:*")
CircuitService.create()   → delByPattern("circuit:*")
CircuitService.update()   → delByPattern("circuit:*")
CircuitService.remove()   → delByPattern("circuit:*")
```

---

## 3. Fichiers modifiés/créés

| Fichier | Action |
|---------|--------|
| `.github/workflows/ci.yml` | Créé |
| `.github/workflows/deploy.yml` | Créé |
| `docker-compose.yml` | Modifié (ajout Redis) |
| `backend/package.json` | Modifié (ajout ioredis) |
| `backend/.env.dev` | Modifié (ajout REDIS_*) |
| `backend/.env.production` | Modifié (ajout REDIS_*) |
| `backend/src/redis/redis.module.ts` | Créé |
| `backend/src/redis/redis.service.ts` | Créé |
| `backend/src/app.module.ts` | Modifié (import RedisModule) |
| `backend/src/offer/offer.service.ts` | Modifié (cache) |
| `backend/src/circuit/circuit.service.ts` | Modifié (cache) |
| `docs/SPRINT_3.md` | Créé (ce fichier) |

---

## 4. Commandes utiles

```bash
# Tester le cache Redis
redis-cli ping                     # PONG
redis-cli keys "offer:*"           # Lister les clés cache
redis-cli ttl offer:list:all       # TTL restant
redis-cli flushall                 # Vider tout le cache (dev)

# Lancer les tests après CI/CD
npm test                           # Tests unitaires
npm run test:e2e                   # Tests E2E
npm run lint                       # Linting
```

---

## 5. Déploiement Redis en local

### Réseau Docker

Le réseau Docker utilisé par tous les services est `tourisme_net` :

```bash
docker network ls
# NAME            DRIVER
# tourisme_net    bridge    ← existant
```

### Lancer Redis manuellement

```bash
docker run -d \
  --name tourisme-redis \
  --network tourisme_net \
  -p 6379:6379 \
  redis:7-alpine
```

| Paramètre | Valeur | Explication |
|-----------|--------|-------------|
| `--name` | `tourisme-redis` | Nom du conteneur |
| `--network` | `tourisme_net` | Même réseau que les autres conteneurs |
| `-p 6379:6379` | Port mapping | Expose Redis sur `localhost:6379` pour l'API locale |

### Vérifier que Redis tourne

```bash
docker ps --filter name=tourisme-redis
docker exec tourisme-redis redis-cli ping
# → PONG
```

### Configuration .env

Les fichiers `.env.dev` et `.env.production` sont dans `.gitignore` (contiennent des secrets). Ajouter manuellement :

```env
# .env.dev (API locale)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=300

# .env.production (API dans Docker)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_TTL=300
```

### Via docker-compose (alternative)

```bash
# Redis est déjà dans docker-compose.yml
docker compose up -d redis
```

---

## 6. Résolution des problèmes CI

### Problème : CI échoue avec `npm ci`

**Cause :** Le projet utilise **yarn** (yarn.lock), pas npm. `npm ci` nécessite `package-lock.json` qui n'existe pas.

**Solution :** Les workflows CI utilisent désormais `yarn install --frozen-lockfile`.

### Problème : Deploy échoue avec `missing server host`

**Cause :** Les secrets GitHub (`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`) ne sont pas configurés.

**Solution :** Configurer les secrets dans GitHub :
1. Va sur GitHub → Settings → Secrets and variables → Actions
2. Ajoute :
   - `DEPLOY_HOST` : IP du serveur
   - `DEPLOY_USER` : Utilisateur SSH
   - `DEPLOY_KEY` : Clé privée SSH

### Workflows GitHub Actions

| Workflow | Déclencheur | Étapes |
|----------|-------------|--------|
| **CI** | Push (main/dev) + PR (main) | Lint backend → Build backend → Tests backend → Lint frontend → Build frontend |
| **Deploy** | Push (main) | Build images Docker |

Voir les runs : https://github.com/bennoomenfaker/tourisme/actions
