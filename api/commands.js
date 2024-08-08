const express = require('express');
const { sequelize } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const { PC, USER } = req.query;

  if (!PC || !USER) {
    return res.status(400).json({ message: 'PC e USER são obrigatórios' });
  }

  try {
    const query = `
      SELECT B_BB_COMANDO.*
      FROM B_BB_COMANDO
      JOIN NFCT ON B_BB_COMANDO.FK_ID_NFCT = NFCT.id
      WHERE NFCT.PC = :PC AND NFCT.USER = :USER AND B_BB_COMANDO.PROCESSADO = false
      ORDER BY B_BB_COMANDO.DT_INCLUSAO DESC
    `;

    const results = await sequelize.query(query, {
      replacements: { PC, USER },
      type: sequelize.QueryTypes.SELECT
    });

    if (results.length > 0) {
      res.status(200).json(results);
    } else {
      res.status(200).json({ message: 'Nenhum comando' });
    }
  } catch (error) {
    console.error('Erro ao buscar comandos:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID do comando é obrigatório' });
  }

  try {
    const updateQuery = `
      UPDATE B_BB_COMANDO
      SET PROCESSADO = true
      WHERE id = :id
    `;

    const [results, metadata] = await sequelize.query(updateQuery, {
      replacements: { id },
      type: sequelize.QueryTypes.UPDATE
    });

    if (metadata.affectedRows === 0) {
      return res.status(404).json({ message: 'Comando não encontrado' });
    }

    res.status(200).json({ message: 'Comando marcado como processado' });
  } catch (error) {
    console.error('Erro ao atualizar comando:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { FK_ID_NFCT, COMANDO } = req.body;

  if (!FK_ID_NFCT || !COMANDO) {
    return res.status(400).json({ message: 'FK_ID_NFCT e COMANDO são obrigatórios' });
  }

  try {
    const insertQuery = `
      INSERT INTO B_BB_COMANDO (FK_ID_NFCT, DT_INCLUSAO, COMANDO, PROCESSADO)
      VALUES (:FK_ID_NFCT, NOW(), :COMANDO, false)
    `;

    await sequelize.query(insertQuery, {
      replacements: { FK_ID_NFCT, COMANDO },
      type: sequelize.QueryTypes.INSERT
    });

    res.status(201).json({ message: 'Comando criado com sucesso' });
  } catch (error) {
    console.error('Erro ao criar comando:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
    