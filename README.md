# SQL Injection Security Lab

## 1. Project Overview

This project demonstrates two common types of **SQL Injection (SQLi)** vulnerabilities in a local web application:

1. **Authentication Bypass**
2. **UNION-Based SQL Injection**

Each experiment includes a vulnerable implementation, a demonstration of the attack using test inputs, an explanation of the root cause, and a secure implementation using parameterized SQL queries.

The purpose of this project is to understand how SQL injection occurs and how secure coding practices can prevent it.

> **Disclaimer:** This project is intended for educational and authorized local testing only. The vulnerable endpoints are deliberately insecure and should never be deployed in a production environment.

## 2. Objectives

- Understand how SQL injection vulnerabilities arise.
- Demonstrate authentication bypass using manipulated SQL input.
- Demonstrate UNION-based SQL injection in a local database.
- Compare vulnerable and secure implementations.
- Implement parameterized queries to prevent SQL injection.
- Test the same inputs against vulnerable and secure endpoints.

## 3. Technologies Used

- **Runtime:** Node.js
- **Web framework:** Express.js
- **Database:** SQLite
- **Database library:** better-sqlite3
- **Frontend:** HTML
- **Tools:** Visual Studio Code, Git, GitHub

## 4. Project Structure

```text
sql-injection-lab/
├── public/
│   └── login.html
├── database.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

The `lab.db` file is generated locally when the application initializes the database. It should not be committed to the public repository.

## 5. Experiment 1: Authentication Bypass

### 5.1 Objective

To demonstrate how an attacker can manipulate an unsafe SQL query to bypass authentication without knowing the correct password.

### 5.2 Vulnerable Endpoint

```text
POST /login-vulnerable
```

### 5.3 Vulnerable Code

The vulnerable endpoint constructs an SQL query by concatenating user-supplied values directly into the query string.

```javascript
const sql =
    `SELECT id, username FROM users ` +
    `WHERE username = '${username}' ` +
    `AND password = '${password}'`;

const user = db.prepare(sql).get();
```

### 5.4 Test Input

Use the following input in the local lab's vulnerable login form:

- **Username:** `admin'-- `
- **Password:** `wrong123`

The username contains a single quote, followed by an SQL comment marker and a trailing space.

### 5.5 Observation

The vulnerable application may authenticate the user even though the supplied password is incorrect.

This happens because the injected comment marker causes the remainder of the SQL statement to be treated as a comment by SQLite. Consequently, the password condition is ignored.

### 5.6 Root Cause

The application directly concatenates untrusted user input into an SQL query. This allows user input to change the structure and meaning of the query instead of being treated strictly as data.

### 5.7 Secure Implementation

The secure endpoint is:

```text
POST /login-safe
```

It uses a parameterized query:

```javascript
const user = db.prepare(
    "SELECT id, username FROM users WHERE username = ? AND password = ?"
).get(username, password);
```

The placeholders (`?`) separate SQL code from user-supplied values.

### 5.8 Verification

Test the same injected username and incorrect password against both endpoints.

| Test | Expected result |
|---|---|
| Injected input on `/login-vulnerable` | Authentication bypass demonstrated |
| Same input on `/login-safe` | Invalid credentials |
| Correct credentials on `/login-safe` | Secure login successful |

**Result:** Parameterized queries prevent the supplied input from modifying the SQL query's structure.

## 6. Experiment 2: UNION-Based SQL Injection

### 6.1 Objective

To demonstrate how an attacker can manipulate an unsafe SQL query using the `UNION` operator to retrieve additional rows from a database.

### 6.2 Vulnerable Endpoint

```text
POST /union-vulnerable
```

### 6.3 Vulnerable Code

The vulnerable endpoint directly concatenates the supplied username into an SQL query.

```javascript
const sql =
    "SELECT username FROM users WHERE username = '" +
    username + "'";

const rows = db.prepare(sql).all();

res.json({
    demonstration: "UNION-based SQL injection",
    results: rows
});
```

### 6.4 Test Input

Enter the following input in the UNION-based vulnerable search form:

```text
' UNION SELECT username FROM users -- 
```

Use this payload only against the local educational application.

### 6.5 Observation

The vulnerable endpoint can return usernames from the database beyond the normal username search result.

The `UNION` operator combines the results of two compatible `SELECT` queries. Because the input is inserted directly into the SQL statement, it can introduce a second query into the original statement.

### 6.6 Root Cause

The application treats user input as part of the SQL command by concatenating it into the query. It does not separate SQL instructions from user-provided data.

### 6.7 Secure Implementation

The secure endpoint is:

```text
POST /union-safe
```

It uses a parameterized query:

```javascript
const rows = db.prepare(
    "SELECT username FROM users WHERE username = ?"
).all(username);

res.json({
    demonstration: "Secure username search",
    results: rows
});
```

### 6.8 Verification

Test the same UNION payload against both endpoints.

| Test | Expected result |
|---|---|
| UNION payload on `/union-vulnerable` | Additional database rows may be returned |
| Same payload on `/union-safe` | Empty results for the tested input |
| Normal username on `/union-safe` | Matching username returned |

**Result:** Parameterized queries prevent the UNION payload from being interpreted as part of the SQL statement.

## 7. Understanding SQL Injection

SQL Injection is a web application vulnerability in which untrusted input is incorporated into an SQL query in a way that allows the input to alter the query's intended logic.

### How it works

1. An application receives input from a user.
2. The application inserts that input directly into an SQL statement.
3. Special characters or SQL syntax in the input can change the meaning of the query.
4. The database executes the resulting query.
5. Depending on the vulnerability and database permissions, an attacker may bypass authentication, access unauthorized data, modify records, or disrupt application functionality.

### Common Types of SQL Injection

- **Authentication bypass:** Attempts to alter login query logic.
- **UNION-based SQL injection:** Attempts to combine results from another `SELECT` query.
- **Error-based SQL injection:** Uses database errors to infer information.
- **Blind SQL injection:** Infers information from application behavior without directly receiving the queried data. Boolean-based and time-based techniques are common forms.

## 8. Mitigation Techniques

### 8.1 Parameterized Queries

Use prepared statements and placeholders instead of concatenating user input into SQL commands. This is the primary mitigation demonstrated in this project.

### 8.2 Input Validation

Validate input according to the application's requirements. For example, usernames may be restricted to an explicitly permitted set of characters and a defined length.

Input validation is an additional safeguard; it should not replace parameterized queries.

### 8.3 Least-Privilege Database Access

Give the database account only the permissions required by the application. Restricting privileges limits the potential impact of a successful injection.

### 8.4 Safe Error Handling

Do not expose raw database errors, SQL statements, or internal implementation details to users. Log diagnostic information securely for development and debugging.

### 8.5 Secure Password Storage

Passwords should not be stored as plaintext in a real application. Use a suitable password-hashing algorithm, such as Argon2id or bcrypt, and verify passwords using the corresponding library.

**Note:** This educational project uses simplified password storage to demonstrate SQL injection. It is not a production-ready authentication system.

## 9. Running the Project Locally

### Prerequisites

Install Node.js and npm.

### Steps

1. Open a terminal in the project directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the server:

   ```bash
   node server.js
   ```

4. Open the following address in your browser:

   ```text
   http://localhost:3000
   ```

5. Test the vulnerable and secure forms using the inputs documented in the experiments above.

Use only the local application and its dummy database for these demonstrations.

## 10. Testing Summary

| Vulnerability | Vulnerable endpoint | Secure endpoint | Mitigation |
|---|---|---|---|
| Authentication bypass | `/login-vulnerable` | `/login-safe` | Parameterized query |
| UNION-based SQL injection | `/union-vulnerable` | `/union-safe` | Parameterized query |

The vulnerable endpoints demonstrate how unsafe query construction can permit SQL injection. The secure endpoints demonstrate how parameterized queries treat the supplied values as data rather than SQL instructions.

## 11. Evidence and Demonstration

The project demonstration should include:

- The local application and its forms.
- Authentication bypass using the documented test input.
- The same authentication input being rejected by the secure endpoint.
- UNION-based injection returning additional rows on the vulnerable endpoint.
- The same UNION input failing to alter the secure query.
- Terminal output or screenshots supporting the observations.

All demonstrations should use the local lab database.

## 12. Limitations

- This is a simplified educational application, not a complete production authentication system.
- The vulnerable endpoints intentionally use unsafe SQL construction.
- The database contains dummy test data.
- The experiments demonstrate selected SQL injection techniques and do not cover every possible SQL injection scenario.
- Additional security measures are necessary before any real-world deployment.

## 13. Conclusion

This project demonstrates two SQL injection vulnerabilities: authentication bypass and UNION-based SQL injection. The experiments show how directly concatenating untrusted input into SQL statements can allow users to alter query behavior.

By comparing vulnerable implementations with secure parameterized queries, the project illustrates an important secure-coding principle: **SQL commands and user-supplied data must be kept separate.**

Additional protections—including input validation, least-privilege database permissions, safe error handling, and secure password hashing—help improve the overall security of a web application.
