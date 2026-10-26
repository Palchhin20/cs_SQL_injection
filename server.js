
const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: false }));

// Display the login page.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// 1. SECURE LOGIN — PARAMETERIZED SQL

app.post("/login-safe", (req, res) => {
  const username = String(req.body.username ?? "");
  const password = String(req.body.password ?? "");

  try {
    const user = db.prepare(
      "SELECT id, username FROM users WHERE username = ? AND password = ?"
    ).get(username, password);

    if (!user) {
      return res.status(401).send(
        "<h2>Login failed</h2>" +
        "<p>Invalid credentials.</p>" +
        "<a href='/'>Back to login</a>"
      );
    }

    return res.send(
      "<h2>Secure login successful</h2>" +
      `<p>Welcome, ${user.username}!</p>` +
      "<a href='/'>Back to login</a>"
    );
  } catch (error) {
    console.error("Secure login database error:", error.message);
    return res.status(500).send("An internal error occurred.");
  }
});

// 2. VULNERABLE LOGIN 

app.post("/login-vulnerable", (req, res) => {
  const username = String(req.body.username ?? "");
  const password = String(req.body.password ?? "");

  // INTENTIONAL VULNERABILITY:
  
  const sql =
    `SELECT id, username FROM users ` +
    `WHERE username = '${username}' ` +
    `AND password = '${password}'`;

  console.log("[LAB ONLY] Vulnerable login route reached.");

  try {
    const user = db.prepare(sql).get();

    if (!user) {
      return res.status(401).send(
        "<h2>Login failed</h2>" +
        "<p>Invalid credentials.</p>" +
        "<a href='/'>Back to login</a>"
      );
    }

    return res.send(
      "<h2>Vulnerable login succeeded</h2>" +
      `<p>Authenticated test account: ${user.username}</p>` +
      "<p>Local educational demonstration only.</p>" +
      "<a href='/'>Back to login</a>"
    );
  } catch (error) {
    // Do not expose database details to the browser.
    console.error("[LAB ONLY] SQL error:", error.message);
    return res.status(400).send(
      "<h2>Request could not be processed</h2>" +
      "<a href='/'>Back to login</a>"
    );
  }
});



/*
 * UNION-based SQL injection demonstration.
 * Uses only the local dummy users table.
 */
app.post("/union-vulnerable", (req, res) => {
  const username = String(req.body.username ?? "");

  // Intentionally unsafe query construction for the local lab.
  const sql =
    "SELECT username FROM users WHERE username = '" +
    username + "'";
    console.log("UNION query:", sql);

  try {
    const rows = db.prepare(sql).all();

    // JSON output makes the returned rows easy to inspect.
    res.json({
      demonstration: "UNION-based SQL injection",
      results: rows
    });
  } catch (error) {
    console.error("UNION demonstration error:", error.message);
    res.status(400).json({
      error: "Query could not be processed"
    });
  }
});



/*
 * Secure UNION search — parameterized query
 */
app.post("/union-safe", (req, res) => {
  const username = String(req.body.username ?? "");

  try {
    const rows = db.prepare(
      "SELECT username FROM users WHERE username = ?"
    ).all(username);

    res.json({
      demonstration: "Secure username search",
      results: rows
    });
  } catch (error) {
    console.error("Secure search error:", error.message);
    res.status(500).json({
      error: "Request could not be processed"
    });
  }
});




// Bind only to localhost for this educational lab.
app.listen(PORT, "127.0.0.1", () => {
  console.log(`Lab running at http://localhost:${PORT}`);
});
