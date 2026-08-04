const pool = require('../config/db');

const Pedido = {
    listarTodos: async () => {
        const [pedidos] = await pool.promise().query(`
            SELECT
                p.id,
                p.tipo_entrega,
                p.status,
                p.valor_total,
                p.observacao,
                p.data_pedido,
                c.nome AS cliente_nome,
                f.descricao AS forma_descricao,
                COUNT(pi.id) AS quantidade_itens
            FROM pedidos p
            INNER JOIN clientes c
                ON c.id = p.id_cliente
            LEFT JOIN formas_pagamento f
                ON f.id = p.id_forma_pagamento
            LEFT JOIN pedido_itens pi
                ON pi.id_pedido = p.id
            GROUP BY
                p.id,
                p.tipo_entrega,
                p.status,
                p.valor_total,
                p.observacao,
                p.data_pedido,
                c.nome,
                f.descricao
            ORDER BY p.data_pedido DESC
        `);

        return pedidos;
    },

    buscarPorId: async (id) => {
        const [pedidos] = await pool.promise().query(
            `
                SELECT
                    p.*,
                    c.nome AS cliente_nome,
                    c.email AS cliente_email,
                    c.telefone AS cliente_telefone,
                    f.descricao AS forma_descricao
                FROM pedidos p
                INNER JOIN clientes c
                    ON c.id = p.id_cliente
                LEFT JOIN formas_pagamento f
                    ON f.id = p.id_forma_pagamento
                WHERE p.id = ?
            `,
            [id]
        );

        return pedidos[0];
    },

    buscarItens: async (idPedido) => {
        const [itens] = await pool.promise().query(
            `
                SELECT
                    pi.id,
                    pi.id_produto,
                    pi.quantidade,
                    pi.preco_unitario,
                    pi.subtotal,
                    pr.nome AS produto_nome
                FROM pedido_itens pi
                INNER JOIN produtos pr
                    ON pr.id = pi.id_produto
                WHERE pi.id_pedido = ?
                ORDER BY pi.id ASC
            `,
            [idPedido]
        );

        return itens;
    },

    buscarDadosFormulario: async () => {
        const banco = pool.promise();

        const [
            [clientes],
            [formas],
            [produtos]
        ] = await Promise.all([
            banco.query(`
                SELECT id, nome
                FROM clientes
                ORDER BY nome ASC
            `),

            banco.query(`
                SELECT id, descricao
                FROM formas_pagamento
                ORDER BY descricao ASC
            `),

            banco.query(`
                SELECT id, nome, preco, tamanho
                FROM produtos
                WHERE disponivel = 1
                ORDER BY nome ASC
            `)
        ]);

        return {
            clientes,
            formas,
            produtos
        };
    },

    criarCompleto: async (dadosPedido) => {
        const conexao = await pool
            .promise()
            .getConnection();

        try {
            await conexao.beginTransaction();

            // Confirma que o cliente existe.
            const [clientes] = await conexao.query(
                `
                    SELECT id
                    FROM clientes
                    WHERE id = ?
                `,
                [dadosPedido.id_cliente]
            );

            if (clientes.length === 0) {
                throw new Error(
                    'O cliente informado não existe.'
                );
            }

            // Confirma a forma de pagamento quando informada.
            if (dadosPedido.id_forma_pagamento) {
                const [formas] = await conexao.query(
                    `
                        SELECT id
                        FROM formas_pagamento
                        WHERE id = ?
                    `,
                    [dadosPedido.id_forma_pagamento]
                );

                if (formas.length === 0) {
                    throw new Error(
                        'A forma de pagamento não existe.'
                    );
                }
            }

            /*
             * Agrupa produtos repetidos.
             * Exemplo:
             * produto 1 quantidade 2
             * produto 1 quantidade 3
             * Resultado: produto 1 quantidade 5
             */
            const itensAgrupados = new Map();

            dadosPedido.itens.forEach((item) => {
                const quantidadeAnterior =
                    itensAgrupados.get(item.id_produto) || 0;

                itensAgrupados.set(
                    item.id_produto,
                    quantidadeAnterior + item.quantidade
                );
            });

            const idsProdutos = Array.from(
                itensAgrupados.keys()
            );

            const marcadores = idsProdutos
                .map(() => '?')
                .join(', ');

            /*
             * O FOR UPDATE mantém os produtos selecionados
             * bloqueados durante a criação do pedido.
             */
            const [produtos] = await conexao.query(
                `
                    SELECT
                        id,
                        nome,
                        preco,
                        disponivel
                    FROM produtos
                    WHERE id IN (${marcadores})
                    FOR UPDATE
                `,
                idsProdutos
            );

            if (produtos.length !== idsProdutos.length) {
                throw new Error(
                    'Um ou mais produtos não foram encontrados.'
                );
            }

            const produtosPorId = new Map();

            produtos.forEach((produto) => {
                produtosPorId.set(
                    Number(produto.id),
                    produto
                );
            });

            let valorTotal = 0;
            const itensParaSalvar = [];

            itensAgrupados.forEach(
                (quantidade, idProduto) => {
                    const produto = produtosPorId.get(
                        Number(idProduto)
                    );

                    if (!produto) {
                        throw new Error(
                            `Produto ${idProduto} não encontrado.`
                        );
                    }

                    if (!produto.disponivel) {
                        throw new Error(
                            `O produto "${produto.nome}" não está disponível.`
                        );
                    }

                    const precoUnitario = Number(
                        produto.preco
                    );

                    valorTotal +=
                        precoUnitario * quantidade;

                    itensParaSalvar.push({
                        id_produto: Number(idProduto),
                        quantidade,
                        preco_unitario: precoUnitario
                    });
                }
            );

            valorTotal = Number(
                valorTotal.toFixed(2)
            );

            const [resultadoPedido] =
                await conexao.query(
                    `
                        INSERT INTO pedidos
                        (
                            id_cliente,
                            id_forma_pagamento,
                            tipo_entrega,
                            status,
                            valor_total,
                            observacao
                        )
                        VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        dadosPedido.id_cliente,
                        dadosPedido.id_forma_pagamento,
                        dadosPedido.tipo_entrega,
                        'NOVO',
                        valorTotal,
                        dadosPedido.observacao
                    ]
                );

            const pedidoId =
                resultadoPedido.insertId;

            const valoresItens = [];
            const marcadoresItens = itensParaSalvar
                .map(() => '(?, ?, ?, ?)')
                .join(', ');

            itensParaSalvar.forEach((item) => {
                valoresItens.push(
                    pedidoId,
                    item.id_produto,
                    item.quantidade,
                    item.preco_unitario
                );
            });

            await conexao.query(
                `
                    INSERT INTO pedido_itens
                    (
                        id_pedido,
                        id_produto,
                        quantidade,
                        preco_unitario
                    )
                    VALUES ${marcadoresItens}
                `,
                valoresItens
            );

            await conexao.commit();

            return {
                pedidoId,
                valorTotal
            };
        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    },

    atualizarStatus: async (id, status) => {
        const [resultado] = await pool
            .promise()
            .query(
                `
                    UPDATE pedidos
                    SET status = ?
                    WHERE id = ?
                `,
                [status, id]
            );

        return resultado.affectedRows;
    },

    excluir: async (id) => {
        const [resultado] = await pool
            .promise()
            .query(
                `
                    DELETE FROM pedidos
                    WHERE id = ?
                `,
                [id]
            );

        return resultado.affectedRows;
    }
};

module.exports = Pedido;