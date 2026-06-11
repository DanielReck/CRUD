const db = require('../config/db');

const Pedido = {
    create: (pedido, callback) => {
        const query = 'INSERT INTO pedidos (id_cliente, id_forma_pagamento, tipo_entrega, status, valor_total, observacao) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [pedido.id_cliente, pedido.id_forma_pagamento || null, pedido.tipo_entrega || 'RETIRADA', pedido.status || 'NOVO', pedido.valor_total || 0.0, pedido.observacao || null], (err, results) => {
            if (err) return callback(err);
            callback(null, results.insertId);
        });
    },

    findById: (id, callback) => {
        const query = 'SELECT p.*, c.nome AS cliente_nome, f.descricao AS forma_descricao FROM pedidos p LEFT JOIN clientes c ON p.id_cliente = c.id LEFT JOIN formas_pagamento f ON p.id_forma_pagamento = f.id WHERE p.id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT p.*, c.nome AS cliente_nome FROM pedidos p LEFT JOIN clientes c ON p.id_cliente = c.id ORDER BY p.data_pedido DESC';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    update: (id, pedido, callback) => {
        const query = 'UPDATE pedidos SET id_cliente = ?, id_forma_pagamento = ?, tipo_entrega = ?, status = ?, valor_total = ?, observacao = ? WHERE id = ?';
        db.query(query, [pedido.id_cliente, pedido.id_forma_pagamento || null, pedido.tipo_entrega, pedido.status, pedido.valor_total || 0.0, pedido.observacao || null, id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM pedidos WHERE id = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
};

module.exports = Pedido;
