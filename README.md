# Wikipedia - зміна мови інтерфейсу (Playwright + TypeScript)

Автотест для перевірки функціоналу зміни мови інтерфейсу Wikipedia авторизованим користувачем.
Тест запускається локально або в Docker-контейнері, HTML-звіт Playwright зберігається в папку на хост-комп'ютері.

## Стек

- [Playwright Test](https://playwright.dev/) + TypeScript
- Page Object Model: page objects успадковують `BasePage`, кожна дія обгорнута в `test.step`, page objects підключаються як фікстури через `test.extend`
- Docker / Docker Compose (образ `mcr.microsoft.com/playwright`)
- `dotenv` - креди користувача беруться з `.env` через `process.env`
- Prettier

## Структура проєкту

```
.
├── fixtures/
│   ├── creds.ts                  # креди з process.env
│   └── languages.ts              # мови та очікувані тексти інтерфейсу
├── interfaces/interfaces.ts
├── pages/
│   ├── basePage.page.ts          # спільна шапка сторінки
│   ├── login.page.ts
│   ├── preferences.page.ts       # Special:Preferences -> User profile -> Internationalisation
│   └── testExtender.ts           # фікстури з page objects
├── tests/
│   └── interfaceLanguage.spec.ts
├── playwright.config.ts
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Тест-кейс

| Поле | Значення |
|---|---|
| **ID** | I18N-TC-001 |
| **Назва** | Успішне перемикання мови інтерфейсу авторизованим користувачем |
| **Модуль** | Preferences -> User profile -> Internationalisation |
| **Пріоритет** | High |
| **Тип** | Functional, Positive, UI |
| **Середовище** | https://en.wikipedia.org, Chromium (desktop, 1920x1080) |

**Передумови:**

1. Існує зареєстрований обліковий запис Wikipedia (креди в `.env`).
2. Користувач авторизований.
3. Поточна мова інтерфейсу облікового запису - `en · English`.

**Тестові дані:** мова `uk · українська`.

**Кроки та очікувані результати:**

| # | Крок | Очікуваний результат |
|---|---|---|
| 1 | Відкрити сторінку **Preferences** (`/wiki/Special:Preferences`) | Відкрилась сторінка "Preferences" |
| 2 | Перейти на вкладку **User profile** | Вкладка "User profile" активна, відображається розділ "Internationalisation" |
| 3 | У розділі **Internationalisation** в полі **Language** ввести `українська` і вибрати `uk · українська` | У полі вибрана мова `uk · українська`, кнопка "Save" стала активною |
| 4 | Натиснути **Save** | Сторінка перезавантажилась, показано повідомлення "Ваші налаштування збережено." |
| 5 | Перевірити сторінку Preferences | Інтерфейс українською: `<html lang="uk">`, заголовок "Налаштування", вкладка "Особові дані", розділ "Інтернаціоналізація" |
| 6 | Відкрити іншу сторінку (Main Page) | Інтерфейс українською: `<html lang="uk">`, вкладка "Читати", пункти меню користувача "Налаштування" і "Вийти" |

**Постумова:** мова інтерфейсу облікового запису повертається на `en · English`
(виконується автоматично в `afterEach`, тому тест можна запускати повторно).

---

## Підготовка

1. Склонувати репозиторій:

   ```bash
   git clone https://github.com/MishaKonev/wikipedia-language-aqa.git
   cd wikipedia-language-aqa
   ```

2. Створити файл `.env` на основі прикладу та вказати креди тестового облікового запису Wikipedia:

   ```bash
   cp .env.example .env
   ```

   ```dotenv
   WIKI_USERNAME=your_test_user
   WIKI_PASSWORD=your_test_password
   ```

   `WIKI_USERNAME` - ім'я користувача так, як воно показується на Wikipedia (з великої літери).
   Файл `.env` додано в `.gitignore` і `.dockerignore`: він не потрапляє ні в репозиторій, ні в Docker-образ.
   Краще використовувати окремий тестовий акаунт: тест змінює його налаштування (і повертає їх назад).

## Запуск у Docker (основний спосіб)

Потрібен встановлений Docker (Docker Desktop) з Docker Compose.

```bash
docker compose build          # зібрати образ
docker compose run --rm tests # запустити тест
```

Або через npm-скрипти: `npm run docker:build` і `npm run docker:test`.

Без Docker Compose:

```bash
docker build -t wikipedia-language-aqa .
docker run --rm --ipc=host --env-file .env \
  -v "$(pwd)/playwright-report:/app/playwright-report" \
  -v "$(pwd)/test-results:/app/test-results" \
  wikipedia-language-aqa
```

## Де шукати звіт

Після виконання тесту в контейнері HTML-звіт записується в папку **`./playwright-report`** на хост-комп'ютері
(папка змонтована в контейнер як volume, тому звіт не залишається всередині контейнера).

Відкрити звіт:

- відкрити файл `playwright-report/index.html` у браузері, або
- `npx playwright show-report` (потрібен Node.js).

Якщо тест падає, скриншоти, відео і trace зберігаються в `./test-results` і прикріплюються до HTML-звіту.

## Локальний запуск без Docker

```bash
npm install
npx playwright install chromium
npm test              # headless
npm run test:headed   # з відкритим браузером
npm run report        # відкрити HTML-звіт
npm run format        # Prettier
```
