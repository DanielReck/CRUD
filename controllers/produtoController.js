const Produto = require('../models/produtoModel');

const produtoController = {
    createProduto: (req, res) => {
        const newProduto = {
            nome: req.body.nome,
            descricao: req.body.descricao,
            preco: parseFloat(req.body.preco) || 0.0,
            tamanho: req.body.tamanho,
            imagem_url: req.body.imagem_url,
            obs: req.body.obs,
            disponivel: req.body.disponivel ? true : false,
        };

        Produto.create(newProduto, (err, produtoId) => {
            if (err) return res.status(500).json({ error: err });
            res.redirect('/produtos');
        });
    },

    getProdutoById: (req, res) => {
        const produtoId = req.params.id;
        Produto.findById(produtoId, (err, produto) => {
            if (err) return res.status(500).json({ error: err });
            if (!produto) return res.status(404).json({ message: 'Produto not found' });
            res.render('produtos/show', { produto });
        });
    },

    getAllProdutos: (req, res) => {
        Produto.getAll((err, produtos) => {
            if (err) return res.status(500).json({ error: err });
            // no categorias table in new schema — render products directly
            res.render('produtos/index', { produtos, categorias: [], categoriaSelecionada: '' });
        });
    },

    renderCreateForm: (req, res) => {
        res.render('produtos/create');
    },

    renderEditForm: (req, res) => {
        const produtoId = req.params.id;
        Produto.findById(produtoId, (err, produto) => {
            if (err) return res.status(500).json({ error: err });
            if (!produto) return res.status(404).json({ message: 'Produto not found' });
            res.render('produtos/edit', { produto });
        });
    },

    updateProduto: (req, res) => {
        const produtoId = req.params.id;
        const updatedProduto = {
            nome: req.body.nome,
            descricao: req.body.descricao,
            preco: parseFloat(req.body.preco) || 0.0,
            tamanho: req.body.tamanho,
            imagem_url: req.body.imagem_url,
            obs: req.body.obs,
            disponivel: req.body.disponivel ? true : false,
        };

        Produto.update(produtoId, updatedProduto, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.redirect('/produtos');
        });
    },

    deleteProduto: (req, res) => {
        const produtoId = req.params.id;
        Produto.delete(produtoId, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.redirect('/produtos');
        });
    }
};

module.exports = produtoController;