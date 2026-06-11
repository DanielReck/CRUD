const Pedido = require('../models/pedidoModel');
const PedidoItem = require('../models/pedidoItemModel');
const FormaPagamento = require('../models/formasPagamentoModel');

const pedidoController = {
    index: (req, res) => {
        Pedido.getAll((err, pedidos) => {
            if (err) return res.status(500).json({ error: err });
            res.render('pedidos/index', { pedidos });
        });
    },

    renderCreate: (req, res) => {
        FormaPagamento.getAll((err, formas) => {
            if (err) return res.status(500).json({ error: err });
            res.render('pedidos/create', { formas });
        });
    },

    create: (req, res) => {
        // basic create: create pedido and its items (items expected as array in body)
        const pedido = {
            id_cliente: req.body.id_cliente,
            id_forma_pagamento: req.body.id_forma_pagamento || null,
            tipo_entrega: req.body.tipo_entrega || 'RETIRADA',
            observacao: req.body.observacao || null,
            valor_total: parseFloat(req.body.valor_total) || 0.0,
        };

        Pedido.create(pedido, (err, pedidoId) => {
            if (err) return res.status(500).json({ error: err });

            const items = Array.isArray(req.body.items) ? req.body.items : [];
            // items: [{id_produto, quantidade, preco_unitario}]
            let created = 0;
            if (items.length === 0) return res.redirect('/pedidos');
            items.forEach(item => {
                const it = {
                    id_pedido: pedidoId,
                    id_produto: item.id_produto,
                    quantidade: item.quantidade || 1,
                    preco_unitario: item.preco_unitario || 0.0
                };
                PedidoItem.create(it, (err2) => {
                    created++;
                    if (created === items.length) {
                        res.redirect('/pedidos/' + pedidoId);
                    }
                });
            });
        });
    },

    show: (req, res) => {
        const id = req.params.id;
        Pedido.findById(id, (err, pedido) => {
            if (err) return res.status(500).json({ error: err });
            if (!pedido) return res.status(404).send('Pedido not found');
            PedidoItem.findByPedidoId(id, (err2, items) => {
                if (err2) return res.status(500).json({ error: err2 });
                res.render('pedidos/show', { pedido, items });
            });
        });
    },

    delete: (req, res) => {
        const id = req.params.id;
        Pedido.delete(id, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.redirect('/pedidos');
        });
    }
};

module.exports = pedidoController;
