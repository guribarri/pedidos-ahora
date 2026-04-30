import express from "express";

import UserController from "./controllers/userController.js";

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const userController = new UserController();

// User
app.post("/login", (req, res) => {
  res.send("LOGIN ROUTE OK");
});

app.get("/test", (req, res) => {
  res.send("OK");
});

// Other routes
// ...
// ...

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
