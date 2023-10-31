const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
})




// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  const getBooks = await books
  if (books) {
    res.json(getBooks);
  } else {
    res.status(404).json({ error: 'Books is not found' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',async function (req, res) {
  //Write your code here
  const isbn = await req.params.isbn;
  if (books[isbn]) {
    res.json(books[isbn]);
  } else {
    res.status(404).json({ error: 'Book is not found' });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
  const author = await req.params.author;
  const matchingBooks = Object.values(books).filter(book => book.author === author);

  if (matchingBooks.length > 0) {
    res.json(matchingBooks);
  } else {
    res.status(404).json({ error: 'The books with this author doesn\'t found' });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  const title = await req.params.title;
  const matchingBooks = Object.values(books).filter(book => book.title === title);

  if (matchingBooks.length > 0) {
    res.json(matchingBooks);
  } else {
    res.status(404).json({ error: 'The books with this title doesn\'t found' });
  }

});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

  if (books[isbn]) {
      const reviews = books[isbn].reviews;
      res.json(reviews);
  } else {
      res.status(404).json({ error: 'The book review with this isbn doesn\'t exist' });
  }
})

module.exports.general = public_users;
