# Math Notes Dokumentacja Techniczna

Aplikacja **Math Notes** pozwala na przechowywanie i zarządzanie wzorami matematycznymi zapisanymi w LaTeX. Wzory można grupować w kategorie, wyszukiwać, filtrować oraz przeglądać w podglądzie renderowanym przez KaTeX. Backend aplikacji w trybie deweloperskim obsługiwany jest przez `json-server` (plik `db.json`).

---

## Spis treści

1. [Uruchomienie projektu](#uruchomienie-projektu)
2. [Struktura projektu](#struktura-projektu)
3. [Typy danych](#typy-danych)
4. [Opis komponentów i logiki](#opis-komponentow-i-logiki)

   * App.tsx
   * CategoryManager.tsx
   * FormulaForm.tsx
   * FormulaList.tsx
5. [API (json-server)](#api-json-server)
6. [Przepływ danych](#przeplyw-danych)
7. [Decyzje projektowe i uzasadnienia](#decyzje-projektowe-i-uzasadnienia)
8. [Możliwe rozszerzenia](#mozliwe-rozszerzenia)
9. [Przykładowy `db.json`](#przykladowy-dbjson)
10. [Licencja i uwagi](#licencja-i-uwagi)

---

## Uruchomienie projektu

1. **Instalacja zależności**

W katalogu projektu uruchom:

```bash
npm install
```

2. **Uruchomienie aplikacji i json-server**

* **Windows:** uruchom `runw.bat` (skrypt odpala `json-server` i frontend, otwiera przeglądarkę).
* **Linux / macOS:** uruchom `runl.sh`.

Po wykonaniu skryptu:

* Backend (json-server) działa pod `http://localhost:4000`.
* Frontend (React) uruchamia się w domyślnej przeglądarce.

> Uwaga: skrypty `runw.bat` i `runl.sh` zakładają, że masz zainstalowany Node.js i npm w systemie.

---

## Struktura projektu

```
src/
 ├── App.tsx             # Główny komponent (logika + integracja z API)
 ├── App.css             # Style aplikacji
 ├── components/
 │    ├── CategoryManager.tsx
 │    ├── FormulaForm.tsx
 │    └── FormulaList.tsx
 └── ...                # inne pliki (ikonki, assets, konfiguracje)
```

---

## Typy danych

Zdefiniowane w `App.tsx` interfejsy TS:

```ts
export interface Category {
  id: number;
  name: string;
}

export interface Formula {
  id: number;
  latex: string;
  description: string;
  categoryId: number;
  createdAt: string; 
}

export interface NewFormulaData extends Omit<Formula, 'id' | 'createdAt'> {}
```

---

## Opis komponentów i logiki

### App.tsx

**Rola:** centralny punkt aplikacji — pobiera / zapisuje dane, zarządza stanem i przekazuje callbacki do komponentów UI.

**Główne stany:**

* `categories: Category[]` — aktualna lista kategorii z backendu.
* `formulas: Formula[]` — aktualna lista wzorów z backendu.
* `loading: boolean` — flaga ładowania podczas pobierania danych.
* `error: string | null` — przechowuje komunikat błędu, jeśli wystąpi.

**Główne funkcje:**

* `loadData()` — pobiera kategorie i wzory równolegle (`Promise.all`) i zapisuje je do stanu. Użycie równoległego zapytania skraca czas startu aplikacji.

* `handleAddCategory(name: string)` — podstawowa walidacja, tworzenie obiektu kategorii (generowane `id` lokalnie przez `Date.now()`), wysyłanie `POST` do `/categories`, oraz aktualizacja stanu `categories` po pomyślnym zakończeniu żądania. Działa asynchronicznie.

* `handleDeleteCategory(id: number)` — weryfikacja, czy kategoria ma przypisane wzory (blokada usuwania), `DELETE` do `/categories/:id` i usunięcie jej ze stanu. Blokada zapobiega powstaniu niezgodności (wzory bez kategorii).

* `handleAddFormula(data: NewFormulaData)` — walidacja pól, zbudowanie obiektu `Formula` (dodanie `id` i `createdAt` w warstwie aplikacji), `POST` do `/formulas` oraz dodanie nowego wzoru na początek listy `formulas`.

* `handleDeleteFormula(id: number)` — `DELETE` do `/formulas/:id` i odfiltrowanie wzoru w stanie.

**Render:**

* W czasie ładowania pokazuje komunikat `Ładowanie danych...`.
* W przypadku błędu pokazuje komunikat o błędzie.
* Gdy dane dostępne, renderuje dwa główne panele: lewy (CategoryManager + FormulaForm) i prawy (FormulaList).

---

### CategoryManager.tsx

**Rola:** interfejs do wyświetlania i zarządzania kategoriami.

**Props:**

* `categories: Category[]`
* `onAddCategory: (name: string) => void`
* `onDeleteCategory: (id: number) => void`

**Stan lokalny:**

* `newCategoryName: string` — kontrolowane pole inputu.

**Zachowanie:**

* Formularz dodawania kategorii używa `e.preventDefault()` i podstawowej walidacji (`trim()`), po czym wywołuje `onAddCategory` i czyści pole.
* Przyciski usuwania wywołują `onDeleteCategory(category.id)`.

**Uzasadnienie projektowe:**

* Komponent nie wykonuje zapytań do API — otrzymuje callbacki z `App.tsx`. Dzięki temu jest łatwy do testowania i ponownego użycia.

---

### FormulaForm.tsx

**Rola:** formularz dodawania nowego wzoru.

**Props:**

* `categories: Category[]`
* `onAddFormula: (formulaData: NewFormulaData) => void`

**Stany lokalne:**

* `latexInput: string` — zawartość pola LaTeX (textarea).
* `descInput: string` — opis wzoru.
* `selectedCatId: string` — wybrana kategoria (string, bo select zwraca string).

**Zachowanie:**

* Walidacja: wymagane `latexInput` oraz wybór kategorii.
* Konstrukcja obiektu `NewFormulaData` z `latex`, `description` i `categoryId` (parsowanie ID z stringa).
* Wywołanie `onAddFormula` i reset formularza.
* Podgląd LaTeX w czasie rzeczywistym przy użyciu `BlockMath` z `react-katex`. `errorColor` ustawia kolor przy błędnym LaTeX.

**Uzasadnienie projektowe:**

* Oddzielenie logiki tworzenia wpisu (API) od UI: formularz przekazuje dane do `App.tsx`.
* Podgląd w czasie rzeczywistym poprawia UX i zmniejsza liczbę błędów w zapisie LaTeX.

---

### FormulaList.tsx

**Rola:** wyświetlanie, filtrowanie i usuwanie wzorów.

**Props:**

* `formulas: Formula[]`
* `categories: Category[]`
* `onDeleteFormula: (id: number) => void`

**Stany lokalne:**

* `selectedCategory: number` — 0 oznacza "Wszystkie".
* `searchTerm: string` — fraza wyszukiwania.

**Filtrowanie:**

* Użycie `useMemo()` do optymalizacji — lista jest przeliczana tylko, gdy zmienią się `formulas`, `selectedCategory` lub `searchTerm`.
* Filtrowanie case-insensitive po `description` i `latex`.

**Render:**

* Pokazuje liczbę wszystkich wzorów.
* Panele kontroli: wyszukiwarka i select kategorii (pokazują także liczbę wzorów w danej kategorii).
* Każdy wpis zawiera: `description`, render LaTeX (`BlockMath`), nazwę kategorii (funkcja pomocnicza `getCategoryName`), `createdAt`, `id`, oraz przycisk Usuń.

**Uzasadnienie projektowe:**

* Filtracja po stronie klienta daje natychmiastową odpowiedź użytkownikowi (bez dodatkowych zapytań do API).
* `useMemo()` zapobiega kosztownym operacjom filtracji przy każdym renderze.

---

## API (json-server)

Standardowy `json-server` pod `http://localhost:4000` wystawia endpoints:

* `GET /categories`

* `POST /categories`

* `DELETE /categories/:id`

* `GET /formulas`

* `POST /formulas`

* `DELETE /formulas/:id`

Upewnij się, że `db.json` ma poprawną strukturę z polami `categories` i `formulas`.

---

## Przepływ danych

1. Po starcie `App.tsx` wywołuje `loadData()` i pobiera kategorie oraz wzory.
2. `App.tsx` zapisuje dane w stanie i przekazuje je do komponentów.
3. Użytkownik:

   * dodaje kategorię przez `CategoryManager` → `App.tsx` wykonuje `POST` i aktualizuje stan;
   * dodaje wzór przez `FormulaForm` → `App.tsx` wykonuje `POST` i dodaje wzór do listy;
   * usuwa wzór/kategorię → `App.tsx` wykonuje `DELETE` i aktualizuje stan.

---

## Decyzje projektowe i uzasadnienia

* **Separation of concerns**: UI i walidacja formularzy zlokalizowane są w komponentach, natomiast operacje na danych (API) realizuje `App.tsx`. Dzięki temu logika aplikacji jest scentralizowana i łatwiejsza do utrzymania.

* **Async/await + obsługa błędów**: operacje sieciowe są obsługiwane asynchronicznie, z obsługą błędów i wskazaniem stanu ładowania.

* **Generowanie ID**: dla prostoty ID są generowane lokalnie (`Date.now()`), co wystarcza do sesyjnego identyfikowania zasobów w `json-server`.

* **Podgląd LaTeX**: renderowanie w komponencie formularza zmniejsza liczbę błędów wprowadzania wzorów.

* **Filtrowanie po stronie klienta**: lepsze UX — natychmiastowy feedback; akceptowalne przy niewielkiej liczbie rekordów.

---

## Możliwe rozszerzenia

* Edycja istniejących wzorów i kategorii (PUT/PATCH).
* Paginacja i serwerowe filtrowanie przy dużej liczbie rekordów.
* Autouzupełnianie i zaawansowane wyszukiwanie (fuzzy search).
* Eksport import (CSV/JSON/PDF) i backupy.
* Uwierzytelnianie i użytkownicy — wielozadaniowe repozytoria wzorów.
* Migracja z `json-server` do rzeczywistej bazy.

---

## Przykładowy `db.json`

```json
{
  "categories": [
    { "id": 1, "name": "Geometria" },
    { "id": 2, "name": "Algebra" }
  ],
  "formulas": [
    {
      "id": 100,
      "latex": "a^2 + b^2 = c^2",
      "description": "Twierdzenie Pitagorasa",
      "categoryId": 1,
      "createdAt": "2025-01-05"
    }
  ]
}
```

---


