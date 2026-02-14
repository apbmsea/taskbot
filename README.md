# Twitch Bot для уведомлений в Telegram

Бот отправляет уведомления в Telegram канал когда стример начинает трансляцию на Twitch.

## Бесплатный хостинг на Render.com

### Шаг 1: Подготовка

1. Создайте аккаунт на [Render.com](https://render.com)
2. Загрузите код на GitHub (создайте репозиторий)

### Шаг 2: Деплой на Render

1. В Render нажмите **New +** → **Web Service**
2. Подключите ваш GitHub репозиторий
3. Настройки:
   - **Name**: `twitchbot` (или любое имя)
   - **Environment**: `Node`
   - **Build Command**: оставьте пустым
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. Добавьте переменные окружения (Environment Variables):
   - `BOT_TOKEN` = ваш токен Telegram бота
   - `TWITCH_CLIENT_ID` = ID приложения Twitch
   - `TWITCH_CLIENT_SECRET` = секрет приложения Twitch
   - `PUBLIC_URL` = `https://ваше-имя-приложения.onrender.com`

5. Нажмите **Create Web Service**

### Шаг 3: Получите URL

После деплоя вы получите URL вида: `https://twitchbot-xxxx.onrender.com`

Обновите переменную `PUBLIC_URL` в настройках Render на этот URL.

## Альтернативные бесплатные хостинги:

- **Railway.app** - 500 часов/месяц бесплатно
- **Fly.io** - 3 VM бесплатно
- **Glitch.com** - бесплатно, но засыпает после 5 минут неактивности

## Локальный запуск:

```bash
npm install
npm start
```

## Использование:

1. Добавьте бота в ваш Telegram канал как администратора
2. Отправьте команду боту:
   ```
   /register twitch_username @your_channel
   ```
3. Бот будет отправлять уведомления в канал когда стример начнет трансляцию

## Структура проекта:

```
src/
  ├── index.js   - точка входа
  ├── bot.js     - Telegram бот
  ├── server.js  - webhook сервер
  └── twitch.js  - работа с Twitch API
```
