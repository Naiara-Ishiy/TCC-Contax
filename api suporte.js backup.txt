const db = require('../dataBase/connection');

module.exports = {
 async listarSuportes(request, response) {
    try {
        const {
            id,
            assunto,
            status,
            usu_id_solicitante,
            usu_id_responsavel,
            dataInicio,
            dataFim,
            somentePrincipais,
            page = 1,
            limit = 5
        } = request.query;

        const idMin = request.query.idMin ? parseInt(request.query.idMin) : undefined;
        const idMax = request.query.idMax ? parseInt(request.query.idMax) : undefined;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const [[{ id_min, id_max }]] = await db.query(`
            SELECT MIN(sup_id) AS id_min, MAX(sup_id) AS id_max FROM SUPORTE
        `);

        const idMinLimite = idMin ??  id_min ?? 0;
        const idMaxLimite = idMax ??  id_max ?? 999999;

        const sup_assunto = assunto ? `%${assunto}%` : `%`;

        let sql = `
            SELECT 
                sup_id, usu_id_solicitante, usu_id_responsavel, 
                sup_assunto, sup_descricao, sup_status, sup_data_abertura, 
                sup_data_suporte, sup_id_resp
            FROM SUPORTE
            WHERE 1=1
            AND sup_assunto LIKE ?
            ${status !== undefined ? 'AND sup_status = ?' : ''}
            ${usu_id_solicitante ? 'AND usu_id_solicitante = ?' : ''}
            ${usu_id_responsavel ? 'AND usu_id_responsavel = ?' : ''}
            ${somentePrincipais === 'true' ? 'AND sup_id_resp IS NULL' : ''}
            ${dataInicio && dataFim ? 'AND sup_data_abertura BETWEEN ? AND ?' : ''}
            ${id ? 'AND sup_id = ?' : 'AND sup_id BETWEEN ? AND ?'}
            LIMIT ?, ?
        `;

        const values = [
            sup_assunto,
            ...(status !== undefined ? [parseInt(status)] : []),
            ...(usu_id_solicitante ? [parseInt(usu_id_solicitante)] : []),
            ...(usu_id_responsavel ? [parseInt(usu_id_responsavel)] : []),
            ...(dataInicio && dataFim ? [dataInicio, dataFim] : []),
            ...(id ? [parseInt(id)] : [idMinLimite, idMaxLimite]),
            offset,
            parseInt(limit)
        ];

        const [rows] = await db.query(sql, values);

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM SUPORTE
            WHERE 1=1
            AND sup_assunto LIKE ?
            ${status !== undefined ? 'AND sup_status = ?' : ''}
            ${usu_id_solicitante ? 'AND usu_id_solicitante = ?' : ''}
            ${usu_id_responsavel ? 'AND usu_id_responsavel = ?' : ''}
            ${somentePrincipais === 'true' ? 'AND sup_id_resp IS NULL' : ''}
            ${dataInicio && dataFim ? 'AND sup_data_abertura BETWEEN ? AND ?' : ''}
            ${id ? 'AND sup_id = ?' : 'AND sup_id BETWEEN ? AND ?'}
        `;

        const countValues = [
            sup_assunto,
            ...(status !== undefined ? [parseInt(status)] : []),
            ...(usu_id_solicitante ? [parseInt(usu_id_solicitante)] : []),
            ...(usu_id_responsavel ? [parseInt(usu_id_responsavel)] : []),
            ...(dataInicio && dataFim ? [dataInicio, dataFim] : []),
            ...(id ? [parseInt(id)] : [idMinLimite, idMaxLimite])
        ];

        const [[{ total }]] = await db.query(countQuery, countValues);

        response.setHeader('X-Total-Count', total);

        return response.status(200).json({
            sucesso: true,
            mensagem: 'Lista de chamados',
            nItens: rows.length,
            dados: rows
        });

    } catch (error) {
        return response.status(500).json({
            sucesso: false,
            mensagem: `Erro ao listar os suportes: ${error.message}`,
            dados: null
        });
    }
},

     async cadastrarSuporte (request, response) {
        try{

            //Dados do corpo da requisição
            const { usu_id_solicitante, usu_id_responsavel, assunto, descricao,
                 dt_abertura, dt_suporte, sup_id_resp } = request.body;
            const sup_status = 1;

            //Instrução SQL
            // PS: usu_id_solicitante e usu_id_responsavel são chaves estrangeiras
            const sql = `
                INSERT INTO SUPORTE 
                    (usu_id_solicitante, usu_id_responsavel, sup_assunto, sup_descricao,
                    sup_status, sup_data_abertura, sup_data_suporte, sup_id_resp) 
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?);
            `;

            //Valores
            const values = [usu_id_solicitante, usu_id_responsavel, assunto, descricao,
                sup_status, dt_abertura, dt_suporte, sup_id_resp];

            //Execução da query
            const [result] =  await db.query(sql, values);

            //Identificação do ID inserido.
            const dados = {
                id : result.insertId,
                usu_id_solicitante, 
                usu_id_responsavel,
                assunto,
                descricao,
                dt_abertura,
                dt_suporte,
                sup_id_resp
            };

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: 'Cadastro de suportes realizado com sucesso',
                    dados: dados
                }
            );
        }        catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: `Erro ao cadastrar os seguintes suportes: ${error.message}`,
                    dados: error.message
                }
            );
        }
    },

    async editarSuporte (request, response) {
        try{

            //parâmetros do corpo da requisição
            const { usu_id_solicitante, usu_id_responsavel, assunto, descricao,
                status, dt_abertura, dt_suporte, sup_id_resp } = request.body;

            //parametros da rota via URL
            const { id } = request.params;

            //Instrução SQL
            const sql = `
                UPDATE SUPORTE SET
                    usu_id_solicitante = ?, usu_id_responsavel = ?, 
                    sup_assunto = ?, sup_descricao = ?,
                    sup_status = ?, sup_data_abertura = ?, 
                    sup_data_suporte = ?, sup_id_resp = ?
                WHERE sup_id = ?;
            `;

            //Valores
            const values = [usu_id_solicitante, usu_id_responsavel, assunto, descricao,
                status,  dt_abertura, dt_suporte, sup_id_resp, id];

            //Execução da query
            const [result] =  await db.query(sql, values);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: `Suporte com ID ${id} não encontrado.`,
                    dados: null
                });
            }

            dados = {
                id,
                usu_id_solicitante,
                usu_id_responsavel,
                assunto,
                descricao,
                status,
                dt_abertura,
                dt_suporte,
                sup_id_resp
            };

            return response.status(200).json(
                {
                    sucesso: true,
                    mensagem: `Pedido de suporte ${id} atualizado com sucesso`,
                    dados
                }
            );
        }        catch (error) {
            return response.status(500).json(
                {
                    sucesso: false,
                    mensagem: 'Erro de requisição.',
                    dados: error.message
                }
            );
        }
    },

    async apagarSuporte(request, response) {
    try {
        const { id } = request.params;

        // DELETE físico
        const sql = `
            DELETE FROM SUPORTE
            WHERE sup_id = ?;
        `;
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return response.status(404).json({
                sucesso: false,
                mensagem: `Chamado de suporte com ID ${id} não encontrado.`,
                dados: null
            });
        }

        return response.status(200).json({
            sucesso: true,
            mensagem: 'Chamado de suporte excluído com sucesso.',
            dados: null
        });

    } catch (error) {
        return response.status(500).json({
            sucesso: false,
            mensagem: `Erro ao remover o chamado de suporte: ${error.message}`,
            dados: null
        });
    }
},

}