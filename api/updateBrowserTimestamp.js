const express = require('express');
const { sequelize } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
  const { PC, USER } = req.body;

  if (!PC || !USER) {
    return res.status(400).json({ message: 'PC e USER são obrigatórios' });
  }

  try {
    const updateQuery = `
      UPDATE B_BB 
      SET DT_BROWSER = NOW() 
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

    const [results, metadata] = await sequelize.query(updateQuery, {
      replacements: { PC, USER },
      type: sequelize.QueryTypes.UPDATE
    });

    if (metadata.affectedRows === 0) {
      return res.status(404).json({ message: 'Registro B_BB não encontrado' });
    }

    res.status(200).json({ message: 'DT_BROWSER atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar DT_BROWSER:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
