# Images du Projet

Ce dossier contient les screenshots de l'application EcoVoyage.

## Galerie de Screenshots

### Dashboard & Navigation
| Screenshot | Description |
|------------|-------------|
| `Screenshot_2026-06-18_12-54-04.png` | Dashboard eco-voyageur avec stats et navigation |
| `Screenshot_2026-06-18_12-54-10.png` | Dashboard guide/proprietaire |
| `Screenshot_2026-06-18_13-25-54.png` | Dashboard avec notification badge |

### Offres & Catalogue
| Screenshot | Description |
|------------|-------------|
| `Screenshot_2026-06-18_12-54-18.png` | Detail d'une offre avec cartes |
| `Screenshot_2026-06-18_12-54-30.png` | Assistant de creation d'offre (GuidedOfferWizard) |
| `Screenshot_2026-06-18_12-54-43.png` | Gestion des prix et sessions |
| `cree offre actvite.png` | Creation d'une offre activite |

### Reservations
| Screenshot | Description |
|------------|-------------|
| `Screenshot_2026-06-18_12-54-50.png` | Formulaire de reservation |
| `Screenshot_2026-06-18_12-59-20.png` | Mes reservations (voyageur) |
| `Screenshot_2026-06-18_12-59-26.png` | Reservations recues (provider) |

### Circuits
| Screenshot | Description |
|------------|-------------|
| `Screenshot_2026-06-18_12-54-57.png` | Liste des circuits |
| `Screenshot_2026-06-18_12-55-03.png` | Detail d'un circuit avec carte |
| `Screenshot_2026-06-18_13-56-15.png` | Circuit avec images et programme |

### Plans de Voyage
| Screenshot | Description |
|------------|-------------|
| `Screenshot_2026-06-18_12-55-13.png` | Liste des trip plans |
| `Screenshot_2026-06-18_12-55-18.png` | Detail d'un trip plan |

### Notifications & Messagerie
| Screenshot | Description |
|------------|-------------|
| `Screenshot_2026-06-18_13-05-29.png` | Page notifications |
| `Screenshot_2026-06-18_13-28-28.png` | Messagerie privee |

### Cartes & Localisation
| Screenshot | Description |
|------------|-------------|
| `Screenshot_2026-06-18_12-55-31.png` | Carte Leaflet sur offre |
| `Screenshot_2026-06-18_12-55-48.png` | Carte sur circuit |

### Auth & Onboarding
| Screenshot | Description |
|------------|-------------|
| `Screenshot_2026-06-18_13-57-21.png` | Page de connexion |
| `Screenshot_2026-06-18_13-57-41.png` | Inscription |
| `Screenshot_2026-06-18_13-57-53.png` | Onboarding eco-voyageur |

### Homepage
| Screenshot | Description |
|------------|-------------|
| `Screenshot_2026-06-18_13-58-39.png` | Landing page EcoVoyage |

## Upload d'images (Cloudinary)

Le projet utilise **Cloudinary** pour l'upload d'images.

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
