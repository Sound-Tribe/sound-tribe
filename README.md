# SoundTribe

## Description

This is a project developed by Marc Bertran Suárez and Gerard Solanes Hernández as the project for the second module at Ironhack. The purpose of the application is to connect music bands with new fans and adventurous listeners. 

Get in the deep jungle of SoundTribe. If you are a music band, form a tribe. If you are an explorer, discover new sounds from the tribes.

---

## Instructions

When cloning the project, change the <code>sample.env</code> for an <code>.env</code> with the values you consider:
```js
PORT=3000
MONGO_URL='mongodb://localhost:27017/app-name'
SESSION_SECRET='SecretOfYourOwnChoosing'
NODE_ENV='development'
```
Then, run:
```bash
npm install
```
To start the project run:
```bash
npm run start
```

To work on the project and have it listen for changes:
```bash
npm run dev
```

---

## Wireframes
Substitute this image with an image of your own app wireframes or designs

![](docs/wireframes_v1.png)

---

## User stories (MVP)
There are 2 types of user:
- Tribe
- (Fans)
Tribe stories
- Tribe can sign up and create and account
- Tribe can login
- Tribe can log out
- Tribe can post a new album
- Tribe can edit (title, image and description) of posted album
- Tribe can delete album
- Tribe can see random posts according their interests of genre in discover page

Fan stories
- Fan can sign up and create and account
- Fan can login
- Fan can log out
- Fan can see random posts according their interests of genre in discover page

## User stories (Backlog)

- Tribe can add tracks to posted album
- Tribe & Fan can like/dislike posts
- Tribe & Fan can follow/unfollow other Tribes
- Tribe can post concerts in calendar
- Add home page with posts from other Tribes you follow

---

## Models

User:

```js
const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, 'Username is required.'],
      unique: true
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    hashedPassword: {
      type: String,
      required: [true, 'Password is required.']
    }
  },
  {
    timestamps: true
  }
);
```

---

## Routes

| Name  | Method | Endpoint    | Protected | Req.body            | Redirects |
|-------|--------|-------------|------|---------------------|-----------|
| Home  | GET   | /           | No   |                     |           |
| Login | GET    | /auth/login | No |                      |           |
| Login | POST | /auth/login   | No | { email, password }  | /         |
| Signup | GET    | /auth/signup | No |                      |           |
| Signup | POST | /auth/signup   | No | { username, email, password }  | /auth/login  |
| New movie  | GET    | /movies/new | Yes |                      |           |
| New movie | POST | /movies/new   | Yes | { title, cast, genre }  | /movies/:movieId   |

---

## Useful links

- [Github Repo]()
- [Trello kanban]()
- [Deployed version]()
- [Presentation slides](https://www.slides.com)



