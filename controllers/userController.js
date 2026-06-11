const Cliente = require('../models/userModel');

const userController = {
    createUser: (req, res) => {
        const newCliente = {
            nome: req.body.nome,
            email: req.body.email,
            telefone: req.body.telefone,
            cpf: req.body.cpf,
            instituicao: req.body.instituicao,
            id_endereco: req.body.id_endereco || null,
        };

        Cliente.create(newCliente, (err, clienteId) => {
            if (err) return res.status(500).json({ error: err });
            res.redirect('/users');
        });
    },

    getUserById: (req, res) => {
        const userId = req.params.id;

        Cliente.findById(userId, (err, cliente) => {
            if (err) return res.status(500).json({ error: err });
            if (!cliente) return res.status(404).json({ message: 'Cliente not found' });
            res.render('users/show', { user: cliente });
        });
    },

    getAllUsers: (req, res) => {
        Cliente.getAll((err, clientes) => {
            if (err) return res.status(500).json({ error: err });
            res.render('users/index', { users: clientes });
        });
    },

    renderCreateForm: (req, res) => {
        res.render('users/create');
    },

    renderEditForm: (req, res) => {
        const userId = req.params.id;

        Cliente.findById(userId, (err, cliente) => {
            if (err) return res.status(500).json({ error: err });
            if (!cliente) return res.status(404).json({ message: 'Cliente not found' });
            res.render('users/edit', { user: cliente });
        });
    },

    updateUser: (req, res) => {
        const userId = req.params.id;
        const updatedCliente = {
            nome: req.body.nome,
            email: req.body.email,
            telefone: req.body.telefone,
            cpf: req.body.cpf,
            instituicao: req.body.instituicao,
            id_endereco: req.body.id_endereco || null,
        };

        Cliente.update(userId, updatedCliente, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.redirect('/users');
        });
    },

    deleteUser: (req, res) => {
        const userId = req.params.id;

        Cliente.delete(userId, (err) => {
            if (err) return res.status(500).json({ error: err });
            res.redirect('/users');
        });
    },

    searchUsers: (req, res) => {
        const search = req.query.search || '';

        Cliente.searchByName(search, (err, clientes) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ users: clientes });
        });
    },
};

module.exports = userController;
