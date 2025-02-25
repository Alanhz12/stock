const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const helmet = require('helmet');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Servir archivos estáticos desde la carpeta 'public'
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", 'https://www.gstatic.com'],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:']
        }
    }
}));

app.post('/add-article', (req, res) => {
    const { barcode, name, quantity } = req.body;
    console.log(`Adding article: ${barcode}, ${name}, ${quantity}`);
    db.get("SELECT * FROM articles WHERE barcode = ? OR name = ?", [barcode, name], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            const newQuantity = row.quantity + quantity;
            db.run("UPDATE articles SET quantity = ? WHERE id = ?", [newQuantity, row.id], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: "Artículo actualizado", id: row.id });
            });
        } else {
            db.run("INSERT INTO articles (barcode, name, quantity) VALUES (?, ?, ?)", [barcode, name, quantity], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: "Artículo agregado", id: this.lastID });
            });
        }
    });
});

app.get('/articles', (req, res) => {
    console.log('Fetching articles');
    db.all("SELECT * FROM articles", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ articles: rows });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
