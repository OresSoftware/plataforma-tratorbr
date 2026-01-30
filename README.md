# Plataforma TratorBR 

Plataforma do agronegocio voltada para marketplace de tratores e venda do app de avaliação de tratores.

## Funcionalidades Principais

### Páginas Públicas:
- **Aplicativo** - Informações sobre o aplicativo TratorBR
- **Contato** - Formulário de contato
- **Termos de Uso** - Termos de uso do sistema
- **Política de Privacidade** - Política de privacidade
- **Ajuda** - Perguntas frequentes (parte do tratorBR e Aplicativo)
- **Quem Somos** - História da TratorBR
- **Sobre App** - Primeiros passos do app 

### Área Administrativa:
- **Login Admin** - Autenticação de administradores
- **Dashboard** - Métricas básicas do sistema
- **Contatos** - Visualização e gerenciamento de contatos recebidos
- **Usuarios** - Visualização e gerenciamento dos usuarios do app
- **Empresa** - Cadastro, visualização e gerenciamento das empresas cadastradas

## Estrutura do Projeto

```
sistema-trator-simplificado/
├── frontend/                 # React + Vite
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   └── lib/           # Bibliotecas auxiliares
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js + Express
│   ├── src/
│   │   ├── controllers/    # Controladores
│   │   ├── routes/        # Rotas da API
│   │   ├── config/        # Configurações
│   │   └── services/      # Serviços
│   ├── middleware/        # Middlewares
│   └── package.json
├── schema.sql             # Estrutura do banco de dados
└── .env.example          # Exemplo de configuração
```

### Estruturas das Branches

- **main** - Principal e em produção 
- **andreFerreira** -  Atulizações e teste
- **devMarketplace** - Desenvolvimento do Marketplace


## Instalação

### Pré-requisitos
- Node.js 18+
- MySQL 8.0+
- npm ou yarn

### 1. Configurar Banco de Dados
```bash
# Criar banco de dados
mysql -u root -p
CREATE DATABASE trator_simplificado;
USE trator_simplificado;

# Importar estrutura
mysql -u root -p trator_simplificado < schema.sql
```

### 2. Configurar Backend
```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp ../.env.example .env
# Editar .env com suas configurações

# Iniciar servidor
npm run start:dev
```

### 3. Configurar Frontend
```bash
cd frontend
npm install

# Iniciar desenvolvimento
npm run dev
```

## Tecnologias Utilizadas

### Frontend:
- React 19
- React Router DOM
- Axios
- Lucide React (ícones)
- Vite

### Backend:
- Node.js
- Express
- MySQL2
- JWT
- bcryptjs
- CORS

## Desenvolvimento

### Comandos Úteis

**Backend:**
```bash
npm run start:dev    # Desenvolvimento com nodemon
npm start           # Produção
```

**Frontend:**
```bash
npm run dev         # Desenvolvimento
npm run build       # Build para produção
npm run preview     # Preview do build
```

## Suporte

Este é um sistema simplificado baseado no sistema original TratorBR. Para dúvidas ou suporte, consulte a documentação original ou entre em contato através do formulário de contato do sistema.

