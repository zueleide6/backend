const express = require('express');
const bcrypt = require('bcrypt');
const { ADM } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
  const { login, senha } = req.body;

  // Verificar se o usuário já existe
  const existingUser = await ADM.findOne({ where: { LOGIN: login } });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash da senha
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(senha, saltRounds);

  // Criar novo usuário
  const newUser = await ADM.create({ LOGIN: login, SENHA: hashedPassword });

  res.status(201).json({ message: 'User created successfully', user: newUser });
});

module.exports = router;
