# Ендпоинты
## Регистрация и авторизация
### Регистрация
* **POST** `/api/users/register`
#### Требования для регистрации
* Пароль должен содержать минимум 6 символов.
* Аватар только в форматах jpg, jpeg, png. Максимум 5МБ.

Тело запроса (**multipart form-data**):
```
firstName
lastName
password
email
avatar
```
В ответе приходит уже готовый для последующей авторизации заголовок с токеном пользователя. 
Так-же возвращается тело ответа формата JSON где этот токен продублирован.
Образец ответа (JSON):
```JSON
{
  "message": "OK",
  "user": {
    "first_name": "Вася",
    "last_name": "Пупкин",
    "email": "vasya1337@yandex.ru",
    "avatar_filename": "Vasya-Pupkin-1581327433551.png"
  },
  "token": "оченьдлиннаяизашифрованнаястрокаявляетсятокеномпользователя"
}
```
#### *avatar_filename* содержит имя файла аватары пользователя, которая, после успешной регистрации, становится доступна по адресу `/avatars/vasya-pupkin-1580157381837.png`

**Возможные ошибки**
* Ошибки валидации тела.
* Отсутствует аватар.
* Почта уже зарегистрирована.

### Логин
* **POST** `/api/users/login`
Тело запроса (JSON):
```JSON
{
  "email": "example@gmail.com",
  "password": "password123"
}
```
В случае успешного логина возвращается уже готовый для последующей авторизации заголовок с токеном пользователя, в теле ответа этот токен продублирован.
Образец ответа (JSON):
```JSON
{
  "message": "OK",
  "user": {
    "email": "example@gmail.com",
    "first_name": "Vasya",
    "last_name": "Pupkin",
    "avatar_filename": "vasya-pupkin-1580157381837.png"
  },
  "token": "оченьдлиннаяизашифрованнаястрокаявляетсятокеномпользователя"
}
```

**Возможные ошибки**
* Ошибки валидации тела.
* Не подходящая комбинация почта, пароль

### Запросить аккаунт
* **GET** `/api/users/` 
Получить инфу об аккаунте пользователя. 
Здесь уже *нужен* токен авторизации (заголовок `Authorization: Bearer <token>`).
Возвращает JSON как при регистрации, только без токена.
```JSON
{
  "message": "OK",
  "user": {
    "email": "example@gmail.com",
    "first_name": "Vasya",
    "last_name": "Pupkin",
    "avatar_filename": "vasya-pupkin-1580157381837.png"
  }
}
```
**Возможные ошибки**
* Ошибка авторизации.

## Overwatch профили
**Для всех последующих ендпоинтов нужен токен авторизации.**
Заголовок (header) - `Authorization: Bearer <token>`.

### Поиск игрока
* **POST** `/api/career/check` 
Проверяет, существует ли статистика для указанного в запросе игрока.
Тело запроса (JSON): 
```JSON
{
  "btag": "Sammy#2461"
}
```
Образец ответа:
```JSON
{
  "message": "OK",
  "playerExists": false
}
```
**Возможные ошибки**
* Ошибки валидации тела.
* Ошибка авторизации.

### Добавить игрока в избранное
* **POST** `/api/career/add` 
Привязывает профиль избранного игрока к пользователю. Можно использовать много раз, пополняя таким образом список избранных игроков.
Тело запроса (JSON): 
```JSON
{
  "btag": "Sammy#2461"
}
```
Образец ответа:
```JSON
{
  "message": "OK"
}
```
**Возможные ошибки**
* Ошибки валидации тела.
* Ошибка авторизации.
* Игрок не найден.
* Игрок уже в списке избранных.

### Получить избранных игроков
* **GET** `/api/career/`
Возвращает информацию по избранным игрокам пользователя.
Образец ответа:
```JSON
{
  "message": "OK",
  "profiles": [
    {
      "name": "Sammy-2461",
      "ow_avatar": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f4c2e1e92d7f3ce8a08b03c4016d1a23528e9281a7de63277870af17481a4f1f.png",
      "rating_tank": null,
      "rating_dps": 4186,
      "rating_heal": null
    },
    {
      "name": "DeadlineV-2124",
      "ow_avatar": "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f4c2e1e92d7f3ce8a08b03c4016d1a23528e9281a7de63277870af17481a4f1f.png",
      "rating_tank": 3303,
      "rating_dps": 2769,
      "rating_heal": 3364
    }
  ]
}
```
**Возможные ошибки**
* Ошибка авторизации.

# Как поднять API
Апи подразумевает наличие на сервере PostgreSQL, базы owfavorites и трех таблиц: account, career_profile, user_favorites. Таблицы можно создать с помощью queries.sql из репозитория.
А так-же для запуска необходимы 2 enviroment variables.
* `owcareer_jwtPrivateKey` - любой ключ для зашифрованных JWT
* `owcareer_pgPassword` - пароль от пользователя postgres
```
git clone https://github.com/FiNEk/ow-career.git
cd ./ow-career
npm install
tsc
node ./build/app.js
```
