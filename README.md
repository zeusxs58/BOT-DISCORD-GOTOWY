# BOT-DISCORD — wielomodułowy bot ticketów i narzędzi (łatwa konfiguracja, MongoDB)

Lekki, modułowy bot na **Discord.js v14** z gotowym systemem **ticketów**, dodatkami (join/leave, verify, regulamin), **slash-komendami**, menu kontekstowym oraz panelami. **Szybki start, prosta konfiguracja w plikach `.yml` i modele Mongoose.**  
> Wymaga bazy **MongoDB** (lokalnie lub w chmurze, np. Atlas).

---

## ✨ Funkcje

- **Tickets**: `/tickets panel|add|remove|rename|close|priority|alert|delete|pin`
- **Obsługa zgłoszeń**: `ticketCreate`, `ticketClaim`, `ticketClose` (eventy)
- **Narzędzia (Utility)**: `/blacklist`, `/calculate`, `/crypto`, `/invoice`
- **Komendy ogólne**: `/help`, `/ping`, `/stats`, `/suggest`
- **Menu kontekstowe**: `suggestAccept`, `suggestDeny`
- **Dodatki (addons)**:
  - **Join/Leave messages** (konfig w `addons/JoinLeaveMessages/config.yml`)
  - **Verify** (role weryfikacyjna, prosty mechanizm)
  - **Regulamin** (automatyczne podpinanie/reguły)
  - **Przykład dodatku** (`addons/example`)
- **Modele MongoDB (Mongoose)**:
  - `guildModel`, `dashboardModel`, `ticketModel`, `ticketPanelModel`,
  - `blacklistedUsersModel`, `suggestionModel`, `reviewsModel`,
  - `paypalInvoicesModel`, `stripeInvoicesModel`
- **Eventy Discorda**: `ready`, `interactionCreate`, `messageCreate|Delete`,
  `guildCreate`, `guildMemberRemove`, `channelDelete`, `sendUserDM`
- **Konfiguracja w YAML**: `config.yml`, `commands.yml` (+ config dla dodatków)
- **Czytelna struktura projektu** i logi (`logs.txt`)

---

## 🧱 Wymagania

- **Node.js ≥ 18.19**
- **MongoDB** (URI do instancji lokalnej lub Atlas)
- **Discord Bot Token** + uprawnienia *applications.commands* oraz *bot*
- (Opcjonalnie) Webhooki/role/kanały zdefiniowane w `config.yml`

---

## 🚀 Szybki start (5 kroków)

1. **Klonuj repo i zainstaluj paczki**
   ```bash
   git clone <URL_REPO>
   cd BOT-DISCORD
   npm install
