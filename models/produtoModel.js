const db = require('../config/db');

// Map to new `produtos` table in migration
const Produto = {
    create: (produto, callback) => {
        const query = 'INSERT INTO produtos (nome, descricao, preco, tamanho, imagem_url, obs, disponivel) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [produto.nome, produto.descricao || null, produto.preco || 0.0, produto.tamanho || null, produto.imagem_url || null, produto.obs || null, produto.disponivel ? 1 : 0], (err, results) => {
            if (err) return callback(err);
            callback(null, results.insertId);
        });
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM produtos WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    update: (id, produto, callback) => {
        const query = 'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, tamanho = ?, imagem_url = ?, obs = ?, disponivel = ? WHERE id = ?';
        db.query(query, [produto.nome, produto.descricao || null, produto.preco || 0.0, produto.tamanho || null, produto.imagem_url || null, produto.obs || null, produto.disponivel ? 1 : 0, id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM produtos WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM produtos';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },
};

module.exports = Produto;