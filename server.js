const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const helmet = require('helmet');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
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

app.use(session({
    secret: 'tu-secreto', // Cambia esto por un secreto seguro
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Usa 'true' si estás en HTTPS
}));

// Ruta para registrar un usuario
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Usuario registrado", id: this.lastID });
    });
});

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            res.json({ message: "Inicio de sesión exitoso" });
        } else {
            res.status(400).json({ message: "Usuario o contraseña incorrectos" });
        }
    });
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Cierre de sesión exitoso" });
    });
});

// Ruta protegida de ejemplo
app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: "No autorizado" });
    }
    res.json({ message: `Usuario ${req.session.userId} autenticado` });
});

// Resto de las rutas y configuraciones
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
    const searchCode = req.query.searchCode; // Obtener el parámetro de búsqueda de la URL
    let sql = "SELECT * FROM articles";
    let params = [];

    if (searchCode) {
        sql += " WHERE id = ? OR barcode = ? OR name LIKE ?";
        params = [searchCode, searchCode, `%${searchCode}%`];
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ articles: rows });
    });
});

// Ruta para eliminar un artículo completo
app.delete('/delete-article/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM articles WHERE id = ?", [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Artículo eliminado", id: id });
    });
});

// Ruta para reducir la cantidad de un artículo
app.post('/reduce-quantity', (req, res) => {
    const { id, quantity } = req.body;

    db.get("SELECT * FROM articles WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: "Artículo no encontrado" });
        }
        if (row.quantity < quantity) {
            return res.status(400).json({ message: "Cantidad insuficiente" });
        }

        const newQuantity = row.quantity - quantity;
        if (newQuantity === 0) {
            db.run("DELETE FROM articles WHERE id = ?", [id], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: "Artículo eliminado completamente", id: id });
            });
        } else {
            db.run("UPDATE articles SET quantity = ? WHERE id = ?", [newQuantity, id], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: "Cantidad reducida", id: id, newQuantity: newQuantity });
            });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
