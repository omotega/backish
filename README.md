# backish

## Technologies used

1. Mongoose

2. MongoDb

3. Express

## Installation

1. Clone the repo
   ```sh
   git clone https://github.com/omotega/backish.git
   ```
2. Install NPM packages
   ```sh
   yarn install
   ```
3. Make a copy of the .env.example file to .env

4. Execute yarn dev and You will be able to access the API from localhost:7777

## APIs

### create User Account

- Route: /api/user/signup
- Method: POST
- Body:

```

{
    "name":"omoyibo tega",
    "email":"tagaomod@gmail.com",
    "password":"fadalawds"
}
```

- Responses

Success

```
{
    "success": true,
    "message": "User registration successful",
    "data": {
        "name": "omoyibo tega",
        "email": "tagaomod@gmail.com",
        "password": "$argon2id$v=19$m=65536,t=3,p=4$FUUe8P4x3u1jiGTy6hdhyw$pIJG9lZeGgOXtYa6UUylezbH3l70tEMhswlXGJwYM3A",
        "role": "user",
        "_id": "650daef9215d874bc6ce4076",
        "createdAt": "2023-09-22T15:12:57.949Z",
        "updatedAt": "2023-09-22T15:12:57.949Z",
        "__v": 0
    }
}
```
