const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
const bodyParser = require("body-parser");

const secretKey = "BJ!ksdhjV12gjkg";

const app = express();

const users = []; // Store registered users

app.use(bodyParser.json()); // Parse JSON request body

// app.use(express.json());

app.use(
  session({
    secret: secretKey,
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  //Write the authenication mechanism here
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"]; // Access Token
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

app.use("/customer", (req, res, next) => {
  // Middleware which tells that the user is authenticated or not
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"]; // Access Token
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

// Registration endpoint
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  // Check if the username already exists
  if (users[username]) {
    return res.status(409).json({ error: "Username already exists." });
  }

  // If everything is fine, store the user
  users[username] = { username, password };
  res.status(201).json({ message: "User registered successfully." });
});

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  // Check if the username exists and the password matches
  if (users[username] && users[username].password === password) {
    // Create a JWT token for the user
    const token = jwt.sign({ username }, secretKey);
    res.json({ message: "User logged in successfully.", token });
  } else {
    res.status(401).json({ error: "Invalid credentials." });
  }
});

// Проверка, что пользователь аутентифицирован
// function ensureAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//       return next();
//     }
//     res.status(401).json({ error: 'Вы должны быть залогинены для выполнения этого действия.' });
//   }

function authenticateUser(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res
      .status(401)
      .json({ error: "You must be logged in to perform this action." });
  }
}

// Add a book review
app.put("/auth/review/:isbn", authenticateUser, (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.user ? req.user.username : null;
  const reviewText = req.body.review;

  if (!username) {
    return res
      .status(401)
      .json({ error: "You must be logged in to post a review." });
  }

  if (!books[isbn]) {
    return res
      .status(404)
      .json({ error: "Book not found with the specified ISBN." });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = reviewText;

  res.json({ message: "Review posted successfully." });
});

// DELETE route for removing a review
app.delete("/auth/review/:isbn", authenticateUser, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.user.username;

  if (!books[isbn]) {
    return res
      .status(404)
      .json({ error: "Book not found with the specified ISBN." });
  }

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    res.json({ message: "Review deleted successfully." });
  } else {
    res
      .status(404)
      .json({ error: "Review not found for the specified ISBN and user." });
  }
});

const PORT = 5001;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
