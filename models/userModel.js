const db = require('../config/db');

// This model now maps to the new `clientes` table from the migration
const Cliente = {
    create: (cliente, callback) => {
        const query = 'INSERT INTO clientes (nome, email, telefone, cpf, instituicao, id_endereco) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [cliente.nome, cliente.email, cliente.telefone || null, cliente.cpf || null, cliente.instituicao || null, cliente.id_endereco || null], (err, results) => {
            if (err) return callback(err);
            callback(null, results.insertId);
        });
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM clientes WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    findByEmail: (email, callback) => {
        const query = 'SELECT * FROM clientes WHERE email = ?';
        db.query(query, [email], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    update: (id, cliente, callback) => {
        const query = 'UPDATE clientes SET nome = ?, email = ?, telefone = ?, cpf = ?, instituicao = ?, id_endereco = ? WHERE id = ?';
        db.query(query, [cliente.nome, cliente.email, cliente.telefone || null, cliente.cpf || null, cliente.instituicao || null, cliente.id_endereco || null, id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM clientes WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM clientes';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    searchByName: (name, callback) => {
        const query = 'SELECT * FROM clientes WHERE nome LIKE ?';
        db.query(query, [`%${name}%`], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },
};

module.exports = Cliente;
