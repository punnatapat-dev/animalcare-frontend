# 🐾 AnimalCare Frontend (Angular v19)

[![Angular Version](https://img.shields.io/badge/Angular-19-dd0031.svg?logo=angular)](https://angular.dev/)
[![Status](https://img.shields.io/badge/Status-Funktional-brightgreen)](https://github.com/YOUR-USERNAME/animalcare-frontend)

Willkommen bei **AnimalCare**! 🇩🇪  
Dies ist das moderne Frontend-System für unsere Tiervermittlungsplattform, entwickelt mit der neuesten **Angular v19** Technologie.

---

## ❤️ Motivation

Dieses Projekt ist ein Herzensprojekt, inspiriert von meinen eigenen Hunden:  
Almond, Joghurt, Taohoo und Kiekie 🐶.

---

## ✨ Highlights

- **Deutsche Benutzeroberfläche:** Vollständig lokalisiert für eine klare Kommunikation.
- **Modernes Framework:** Erstellt mit der neuesten **Angular v19** Technologie.
- **Zoneless Change Detection:** Maximale Performance durch `provideZonelessChangeDetection()`.
- **Angular Signals:** Reaktive Datenverwaltung für sofortige UI-Updates.
- **Full CRUD Integration:** Anzeigen (GET), Hinzufügen (POST) und Löschen (DELETE) von Tierdaten.

---

## 🛠️ Tech Stack

- **Core:** [Angular 19](https://angular.dev/)
- **State Management:** Angular Signals
- **Kommunikation:** HttpClient (RxJS) & REST API
- **Backend-Anbindung:** Django REST Framework (Port 8000)

---

## 📜 Update-Historie (Roadmap & Erfolge)

### ✅ **19.02.2026 - Durchbruch & Stabilisierung**

- **[Fixed]** Fehler **TS2724** behoben: Umstellung auf die stabile `provideZonelessChangeDetection`.
- **[New Feature]** **Löschfunktion**: Implementierung des "Löschen"-Buttons mit `signals.update` für Echtzeit-Feedback.
- **[UI]** Optimierung der Kartenansicht (Cards) und Integration der DELETE-Methode.

### ✅ **18.02.2026 - Signal-Migration**

- **Angular Signals**: Umstellung auf `signal<any[]>([]);` für die Tierliste.
- **Dynamic Icons**: Emojis für CAT, DOG und RABBIT implementiert.

### ✅ **17.02.2026 - Full-Stack Integration**

- **API-Anbindung**: Erste erfolgreiche Datenübertragung vom Django REST Framework.
- **Bugfixes**: Fehler "NG0908" (Zone.js) und Probleme mit der JSON-Struktur (`results`) behoben.

### ✅ **Frühere Meilensteine**

- [x] Angular v19 Grundgerüst & Setup
- [x] Deutsche Lokalisierung (UI)
- [x] animal-list Komponenten-Architektur

---

## 📊 Nächste Schritte

- [ ] Meilenstein 5: JWT Authentifizierung & Login-System ⏳
- [ ] Meilenstein 6: Bearbeitungsmodus (Edit Animal) ⏳

---

## 📦 Installation & Start

```bash
# Repository klonen
git clone [https://github.com/YOUR-USERNAME/animalcare-frontend.git](https://github.com/YOUR-USERNAME/animalcare-frontend.git)
cd animalcare-frontend

# Abhängigkeiten installieren
npm install

# Frontend starten
ng serve
```
