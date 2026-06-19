# Images du Projet

Ce dossier contient les images/presentations du projet pour Maram.

## Comment l'upload d'images fonctionne

Le projet utilise **Cloudinary** pour l'upload d'images. L'upload est gere via le composant `ImageUploader` qui:

1. L'utilisateur selectionne un fichier image (JPG, PNG, WebP)
2. Le fichier est envoye a `POST /upload` (backend NestJS)
3. Le backend upload l'image vers Cloudinary (dossier `eco-tourism/`)
4. Cloudinary retourne une URL securisee
5. L'URL est stockee dans la base de donnees

### Endpoints upload

| Endpoint | Methode | Description |
|----------|---------|-------------|
| `/upload` | POST | Upload une image vers Cloudinary (auth requis) |

### Composants frontend

| Composant | Usage |
|-----------|-------|
| `frontend/components/ImageUploader.tsx` | Zone de drag-and-drop + preview + upload |
| Utilise dans : | CreateCircuitModal, circuit edit modal, GuidedOfferWizard |

### Variables d'environnement Cloudinary

```
CLOUDINARY_CLOUD_NAME=depzhocsd
CLOUDINARY_API_KEY=935115496243294
CLOUDINARY_API_SECRET=...
```
