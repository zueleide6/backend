const express = require('express');
const { sequelize } = require('../models');

const router = express.Router();
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

async function selectCollector(pc, user) {
  const selectQuery = `
    SELECT bb.id
    FROM B_BB bb
    JOIN NFCT nfct ON nfct.id = bb.FK_ID_NFCT
    WHERE nfct.PC = :PC AND nfct.USER = :USER
    ORDER BY bb.DT_INCLUSAO DESC
    LIMIT 1
  `;

  return await sequelize.query(selectQuery, {
    replacements: { PC: pc, USER: user },
    type: sequelize.QueryTypes.SELECT
  });
}

async function insertCollector(pc, user) {
  const insertQuery = `
    INSERT INTO B_BB (FK_ID_NFCT, DT_COLLECTOR)
    SELECT nfct.id, NOW()
    FROM NFCT nfct
    WHERE nfct.PC = :PC AND nfct.USER = :USER
  `;

  return await sequelize.query(insertQuery, {
    replacements: { PC: pc, USER: user },
    type: sequelize.QueryTypes.INSERT
  });
}

async function updateCollector(pc, user) {
  const updateQuery = `
      UPDATE B_BB 
      SET DT_COLLECTOR = NOW() 
      WHERE id = (
        SELECT id 
        FROM (
          SELECT bb.id 
          FROM B_BB bb 
          JOIN NFCT nfct ON nfct.id = bb.FK_ID_NFCT 
          WHERE nfct.PC = :PC AND nfct.USER = :USER 
          ORDER BY bb.DT_INCLUSAO DESC 
          LIMIT 1
        ) AS subquery
      )
  `;

  return await sequelize.query(updateQuery, {
    replacements: { PC: pc, USER: user },
    type: sequelize.QueryTypes.UPDATE
  });
}

router.post('/', async (req, res) => {
  const { PC, USER } = req.body;

  if (!PC || !USER) {
    return res.status(400).json({ message: 'PC e USER são obrigatórios' });
  }

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      const [results] = await selectCollector(PC, USER);

      if (results.length === 0) {
        await insertCollector(PC, USER);
        return res.status(201).json({ message: 'DT_COLLECTOR inserido com sucesso' });
      } else {
        await updateCollector(PC, USER);
        return res.status(200).json({ message: 'DT_COLLECTOR atualizado com sucesso' });
      }
    } catch (error) {
      if (error.message.includes('Deadlock found')) {
        attempt++;
        if (attempt < MAX_RETRIES) {
          console.warn(`Deadlock detected. Retrying... (${attempt}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
      }
      console.error('Erro ao atualizar ou inserir DT_COLLECTOR:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
