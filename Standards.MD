# Project Standards

## 🧠 Technologieën
- **Framework:** React (Vite)
- **Taal:** JavaScript (ES6+)
- **Styling:** CSS
- **Data-opslag:** Externe API (Wger) of eigen JSON-bestand
- **Versiebeheer:** GitHub
- **Afbeeldingenhosting:** API of Cloudinary

## 📊 API-Referenties

### Wger API
- **URL:** https://wger.de/api/v2/
- **Documentatie:** https://wger.de/en/software/api
- **Voordelen:** Gratis, veel oefeningen
- **Nadelen:** Inconsistentie in data (ontbrekende namen, beschrijvingen en afbeeldingen)

### Alternatieven (mogelijke vervangers)
| API / Dataset | Type | Link |
|----------------|------|------|
| **ExerciseDB API** | Gratis | [https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb) |
| **Ninja Fitness API** | Gratis | [https://api-ninjas.com/api/exercises](https://api-ninjas.com/api/exercises) |


## 🧪 Testplan
Omdat ik een **online API** gebruik, ga ik testen op:
- Response tijd (vertraging tussen request en data)
- Consistentie (controleren of elk object minstens `name`, `description`, `image` heeft)
- Fallbacks (toon placeholder als data ontbreekt)
- Error handling (bv. wanneer API offline is)

## ⚙️ Beslissing
Indien de Wger API te inconsistent blijkt, maak ik:
- Een **eigen JSON-file** (`exercises.json`) met alle oefeningen die ik wil tonen.
- Afbeeldingen host ik op **Cloudinary** voor betrouwbaarheid.
- Zo kan ik consistent data tonen, ook offline.
