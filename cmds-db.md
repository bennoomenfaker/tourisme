# Commandes Docker — Base de données PostgreSQL (tourisme-db-1)

## Récupérer les emails
```bash
docker exec tourisme-db-1 psql -U marammejri -d tourism_db -c "SELECT email FROM users;"
docker exec tourisme-db-1 psql -U marammejri -d tourism_db -t -A -c "SELECT email FROM users;" > emails.txt
```

## Récupérer les offres
```bash
docker exec tourisme-db-1 psql -U marammejri -d tourism_db -c "SELECT * FROM offers;"
docker exec tourisme-db-1 psql -U marammejri -d tourism_db -c "COPY offers TO STDOUT WITH CSV HEADER;" > offres.csv
```

## Récupérer les projets
```bash
docker exec tourisme-db-1 psql -U marammejri -d tourism_db -c "SELECT * FROM projects;"
docker exec tourisme-db-1 psql -U marammejri -d tourism_db -c "COPY projects TO STDOUT WITH CSV HEADER;" > projets.csv
```

## Supprimer une offre par ID
```bash
docker exec -it tourisme-db-1 psql -U marammejri -d tourism_db -c "DELETE FROM offers WHERE id = '<ID>';"
```

## Supprimer un projet par ID
```bash
docker exec -it tourisme-db-1 psql -U marammejri -d tourism_db -c "DELETE FROM projects WHERE id = '<ID>';"
```

## Supprimer toutes les offres en attente (pending)
```bash
docker exec -it tourisme-db-1 psql -U marammejri -d tourism_db -c "DELETE FROM offers WHERE status = 'pending';"
```

## Supprimer tous les projets en attente (pending)
```bash
docker exec -it tourisme-db-1 psql -U marammejri -d tourism_db -c "DELETE FROM projects WHERE status = 'pending';"
```

## Supprimer les offres de test (IDs spécifiques)
```bash
docker exec -it tourisme-db-1 psql -U marammejri -d tourism_db -c "DELETE FROM offers WHERE id IN ('b2b63659-0d6b-4994-acf7-672d8f36e5dd', '17a947ef-bf39-4c30-9603-152ddaa23950');"
```
