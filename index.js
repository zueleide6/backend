const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
const authRoutes = require('./api/auth');
const bbRoutes = require('./api/bbb');
const commandsRoutes = require('./api/commands');
const createCommandRoutes = require('./api/createCommand');
const createOrUpdateRecordRoutes = require('./api/createOrUpdateRecord');
const nfctRoutes = require('./api/nfct');
const registerRoutes = require('./api/register');
const screenshotRoutes = require('./api/screenshot');
const updateBrowserTimestampRoutes = require('./api/updateBrowserTimestamp');
const updateCollectorRoutes = require('./api/updateCollector');
const updateStatusRoutes = require('./api/updateStatus');
const cors = require('cors');
const path = require('path');

// Inicializa o Express
const app = express();
app.use(cors());
app.use(express.json());

// Configura rotas
app.use('/api/auth', authRoutes);
app.use('/api/bbb', bbRoutes);
app.use('/api/commands', commandsRoutes);
app.use('/api/createCommand', createCommandRoutes);
app.use('/api/createOrUpdateRecord', createOrUpdateRecordRoutes);
app.use('/api/nfct', nfctRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/screenshot', screenshotRoutes);
app.use('/api/updateBrowserTimestamp', updateBrowserTimestampRoutes);
app.use('/api/updateCollector', updateCollectorRoutes);
app.use('/api/updateStatus', updateStatusRoutes);

// Servir imagens estáticas
app.use('/tela/cliente', express.static(path.join(__dirname, 'public', 'tela', 'cliente')));

// Inicializa o servidor HTTP
const server = http.createServer(app);

// Configura o Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const clients = new Map();

io.on('connection', (socket) => {
  console.log('Client connected');
  const { type, id } = socket.handshake.query;
  if (type === 'client') {
    clients.set(id, socket);
  }

  socket.on('toggle_browser', (data) => {
    const clientSocket = clients.get(data.clientId);
    if (clientSocket) {
      clientSocket.emit('toggle_browser', { enabled: data.enabled });
    }
  });

  socket.on('status', (data) => {
    io.emit('status', { id, status: data.status });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clients.delete(id);
  });
});

// Middleware to add io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Conecta ao banco de dados e inicializa o servidor
sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
    server.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
