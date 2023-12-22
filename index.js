const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();
const PORT = 3000;
const cors = require('cors');
app.use(cors());

// Conexión a la base de datos SQLite
const db = new sqlite3.Database(path.resolve(__dirname, 'gifcard.db'), sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
    console.log('Conectado a la base de datos SQLite.');
});

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Ruta para obtener productos
app.get('/api/productos', (req, res) => {
    const sql = 'SELECT * FROM productos';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(rows);
    });
});

function generateVoucherID() {
    return Math.random().toString(36).substr(2, 9);
}
app.post('/api/vouchers', (req, res) => {
 
        const { from_text, to_text, message, productId, monto } = req.body;
    
        // Determinar si se ha enviado un producto o un monto
        let product_id = null;
        let montoValue = null;
    
        if (productId) {
            product_id = productId; // Usar productId si está presente
        } else if (monto) {
            montoValue = monto; // Usar monto si productId no está presente
        }
    const voucherId = generateVoucherID();
    const voucherUrl = `http://localhost:3000/gifcard.html?voucher_id=${voucherId}`;
    
    const sql = `INSERT INTO vouchers (id, message, redeemed, from_text, to_text, product_id, monto, url, activa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [voucherId, message, 0, from_text, to_text, product_id, montoValue, voucherUrl, 0], function(err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json({ voucherId, url: voucherUrl });
    });
});



// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`Accede al servidor en: http://localhost:${PORT}`);
});


app.post('/api/productos', (req, res) => {
    const { nombre } = req.body;

    const sql = 'INSERT INTO productos (nombre) VALUES (?)';

    db.run(sql, [nombre], function(err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json({ productId: this.lastID, nombre });
    });
});


// Ruta para obtener los detalles de un gift card específico
app.get('/api/vouchers/:id', (req, res) => {
    const { id } = req.params;
    // La consulta SQL con JOIN para obtener los detalles del gift card y el nombre del producto
    const sql = `
        SELECT vouchers.*, productos.nombre as producto_nombre
        FROM vouchers
        LEFT JOIN productos ON vouchers.product_id = productos.id
        WHERE vouchers.id = ?
    `;

    db.get(sql, [id], (err, row) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        if (row) {
            res.json(row); // Esto incluirá 'producto_nombre' en el resultado
        } else {
            res.status(404).send('Gift card no encontrado');
        }
    });
});


// Ruta para actualizar los detalles de un gift card
app.put('/api/vouchers/:id', (req, res) => {
    const { id } = req.params;
    const { message, from_text, to_text, valid_until, activa, product_id, monto } = req.body;

    const sql = `UPDATE vouchers SET message = ?, from_text = ?, to_text = ?, valid_until = ?, activa = ?, product_id = ?, monto = ? WHERE id = ?`;

    db.run(sql, [message, from_text, to_text, valid_until, activa, product_id, monto, id], function(err) {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json({ success: true, id: id });
    });
});


// Ruta para obtener todos los gift cards
app.get('/api/vouchers', (req, res) => {
    const sql = `SELECT * FROM vouchers`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(rows); // Devuelve todos los vouchers como JSON
    });
});
