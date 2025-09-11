require('dotenv').config();
const express = require('express');
const cors = require('cors');

const adminRoutes = require('./routes/adminRoutes');
const contatoRoutes = require('./routes/contatoRoutes');

const app = express();

// Se houver proxy reverso (NGINX/Cloudflare), isso garante IP correto
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRoutes);
app.use('/api/contatos', contatoRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend simplificado rodando na porta ${PORT}`);
});

