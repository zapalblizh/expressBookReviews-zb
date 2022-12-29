const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (!isValid(username)) {
            users.push({"username":username,"password":password});
            return res.status(200).json({message:`User ${username} registered`});
        }
        else {
            return res.status(400).json({message:`User ${username} already registered`});
        }
    }
    else {
        return res.status(404).json({message: "Must provide username and password"});
    }
});

function getBooks() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

public_users.get('/',function (req, res) {
    getBooks().then((bks) => res.send(JSON.stringify(bks)));
});

function getByISBN(isbn) {
    return new Promise((resolve, reject) => {
        let isbnNumber = parseInt(isbn);
        if (books[isbnNumber]) {
            resolve(books[isbnNumber]);
        } else {
            reject({status:404, message:`ISBN ${isbn} not found`});
        }
    })
}

public_users.get('/isbn/:isbn',function (req, res) {
    getByISBN(req.params.isbn)
    .then(
        result => res.send(result),
        error => res.status(error.status).json({message: error.message})
    );
});
  
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.author === author))
    .then((filteredBooks) => res.send(filteredBooks));
});

public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    getBooks()
    .then((bookEntries) => Object.values(bookEntries))
    .then((books) => books.filter((book) => book.title === title))
    .then((filteredBooks) => res.send(filteredBooks));
});

public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    getByISBN(req.params.isbn)
    .then(
      result => res.send(result.reviews),
      error => res.status(error.status).json({message: error.message})
    );
});

module.exports.general = public_users;
