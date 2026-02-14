# ⚠️ ВАЖНО: Настройка PUBLIC_URL

После создания Web Service на Render вы получите URL вида:
```
https://twitchbot-xxxx.onrender.com
```

## Как узнать свой URL:

1. Зайдите в ваш Web Service на Render
2. Вверху страницы будет ваш URL (например: `https://twitchbot-abc123.onrender.com`)
3. Скопируйте его

## Как установить PUBLIC_URL:

1. На странице вашего сервиса перейдите в **Environment**
2. Найдите переменную `PUBLIC_URL`
3. Замените `https://your-app-name.onrender.com` на ваш реальный URL
4. Нажмите **Save Changes**
5. Сервис автоматически перезапустится

## Пример:

Если ваш URL: `https://twitchbot-abc123.onrender.com`

То установите:
```
PUBLIC_URL=https://twitchbot-abc123.onrender.com
```

**БЕЗ слэша в конце!**

После этого в логах должно появиться:
```
Telegram webhook установлен: https://twitchbot-abc123.onrender.com/telegram/...
```
