const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE articles (id INTEGER PRIMARY KEY AUTOINCREMENT, barcode TEXT, name TEXT, quantity INTEGER)");
});

module.exports = db;
