const express = require('express');
const { NFCT, B_BB, sequelize } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
  const { PC, USER, BANCO, status, DT_BROWSER = null } = req.body;

  if (!PC || !USER || !BANCO || !status) {
    return res.status(400).json({ message: 'PC, USER, BANCO e Status são obrigatórios' });
  }

  try {
    const client = await NFCT.findOne({ where: { PC, USER, BANCO } });
    if (!client) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const lastRecord = await B_BB.findOne({
      where: { FK_ID_NFCT: client.id },
      order: [['DT_INCLUSAO', 'DESC']]
    });

    if (!lastRecord) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }

    // Atualizar o campo DT_COLLECTOR com a hora do servidor MySQL no timezone correto
    await sequelize.query(
      'UPDATE B_BB SET DT_COLLECTOR = NOW() WHERE id = ?',
      { replacements: [lastRecord.id] }
    );

    if (DT_BROWSER) {
      await sequelize.query(
        'UPDATE B_BB SET DT_BROWSER = NOW() WHERE id = ?',
        { replacements: [DT_BROWSER, lastRecord.id] }
      );
    }

    return res.status(200).json({ message: 'Status atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
