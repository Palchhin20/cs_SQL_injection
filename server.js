
const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login-safe", (req, res) => {
  const username = String(req.body.username ?? "");
  const password = String(req.body.password ?? "");

  const user = db.prepare(
    "SELECT id, username FROM users WHERE username = ? AND password = ?"
  ).get(username, password);

  if (!user) {
    return res.status(401).send(
      "<h2>Login failed</h2><p>Invalid credentials.</p><a href='/'>Try again</a>"
    );
  }

  res.send(
    `<h2>Login successful</h2><p>Authenticated test account: ${user.username}</p><a href='/'>Back</a>`
  );
});

app.listen(PORT, () => {
  console.log(`Lab running at http://localhost:${PORT}`);
});
