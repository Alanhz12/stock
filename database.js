

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE articles (id INTEGER PRIMARY KEY AUTOINCREMENT, barcode TEXT, name TEXT, quantity INTEGER)");
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
});

module.exports = db;
