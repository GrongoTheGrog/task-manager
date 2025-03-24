# Taskify 
Taskify is a full-stack task manager app built with **Node.js, React, and MongoDB**.  

The main goal of this project was to **get familiar with a real-world application structure** rather than working on small, isolated projects. 


## Features:

✔ Real time updates with WebSockets (Socket.io)

✔ Role based team colaboration system

✔ A high interactive kanban board

✔ Dinamic calendar for tasks display


## Tech Stack

- **Frontend:** React  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (mongoose)
- **WebSockets:** Socket.io 

## How to clone it

```sh
git clone https://github.com/GrongoTheGrog/task-manager
```

The project's root folder is divided in two parts: backend and frontend.

Each one has its own dependencies. Select each folder and install them.

### **frontend**
  
- **install dependencies:**

```sh
cd frontend
npm i
````

- **run the react app:**

```sh
npm start
```

### **backend**

- **install dependencies:**

```sh
cd backend
npm i
```

- **create an .env file:**

create an .env file containing the following variables:

```sh
DATABASE_URI=put_your_mongoDB_uri

ACCESS_TOKEN_SECRET=token_for_the_access_jwt_token

REFRESH_TOKEN_SECRET=token_for_the_refresh_jwt_token

EMAIL_KEY=your_email_app_password_for_the_nodemailer
```

- **run server**

```sh
npm run dev
```


## UI:

### Home Page

![image](https://github.com/user-attachments/assets/5b02015f-c1e0-447f-884d-f7126127b1eb)

### Kanban

![image](https://github.com/user-attachments/assets/1f726b06-8690-4989-b9dc-8f4b44b07ea2)

### Calendar

![image](https://github.com/user-attachments/assets/e9554a35-5250-4358-bdd5-ababf525fed8)





