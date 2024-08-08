const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ADM } = require('../models'); // Atualizado o caminho

const router = express.Router();
const SECRET_KEY = 'kamehamehaa';

router.post('/', async (req, res) => {
  const { login, senha } = req.body;
  const user = await ADM.findOne({ where: { LOGIN: login } });

  if (user && bcrypt.compareSync(senha, user.SENHA)) {
    const token = jwt.sign({ id: user.ID }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

module.exports = router;
