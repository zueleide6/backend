const express = require('express');
const fs = require('fs');
const path = require('path');
const { NFCT } = require('../models');

const router = express.Router();

router.post('/', async (req, res) => {
  const { PC, USER, image } = req.body;

  const sanitizedPC = PC.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const sanitizedUser = USER.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const imagePath = path.join(process.cwd(), 'public', 'tela', 'cliente', `${sanitizedPC}_${sanitizedUser}.jpg`);

  try {
    fs.mkdirSync(path.dirname(imagePath), { recursive: true });

    const imageBuffer = Buffer.from(image, 'base64');
    fs.writeFile(imagePath, imageBuffer, async (err) => {
      if (err) {
        console.error(`Failed to save image: ${err.message}`);
        return res.status(500).json({ error: 'Error saving image', details: err.message });
      }

      // Update the `updatedAt` field and status to ONLINE
      await NFCT.update({ updatedAt: new Date(), status: 'ONLINE' }, {
        where: {
          PC,
          USER
        }
      });

      console.log(`Image saved: ${imagePath}`);
      res.status(200).json({ message: 'Image saved' });
    });
  } catch (error) {
    console.error(`Failed to save image: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
