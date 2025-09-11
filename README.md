# Sistema TratorBR Simplificado

Este é uma versão simplificada do sistema TratorBR, mantendo apenas as funcionalidades essenciais:

## Funcionalidades Mantidas

### Páginas Públicas:
- **Página Inicial** - Navegação simples entre as seções
- **Aplicativo** - Informações sobre o aplicativo TratorBR
- **Contato** - Formulário de contato
- **Termos de Uso** - Termos de uso do sistema
- **Política de Privacidade** - Política de privacidade
- **Dúvidas** - Perguntas frequentes (parte do tratorBR)

### Área Administrativa:
- **Login Admin** - Autenticação de administradores
- **Dashboard** - Métricas básicas do sistema
- **Gerenciar IPs** - Liberação de IPs para administradores (apenas Master)
- **Contatos** - Visualização e gerenciamento de contatos recebidos

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

## Configuração

### Variáveis de Ambiente (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=trator_simplificado
JWT_SECRET=sua_chave_secreta_muito_segura
PORT=3001
NODE_ENV=development
```

### Primeiro Acesso Admin
1. Acesse `/admin/login`
2. Use as credenciais configuradas no banco de dados
3. Configure os IPs autorizados (apenas usuários Master)

## Funcionalidades Removidas

As seguintes funcionalidades foram removidas desta versão simplificada:
- Sistema de login de usuários
- Cadastro de usuários
- Gestão de revendedores
- Sistema de aprovação de revendedores
- Gestão de usuários com acesso à troca
- Solicitações de troca
- Gestão completa de usuários

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

## Estrutura de Páginas

### Públicas:
- `/` - Página inicial
- `/aplicativo` - Informações do app
- `/contato` - Formulário de contato
- `/termos-uso` - Termos de uso
- `/politica-privacidade` - Política de privacidade
- `/admin/duvidas` - Dúvidas frequentes

### Administrativas:
- `/admin/login` - Login administrativo
- `/admin/dashboard` - Dashboard principal
- `/admin/ips` - Gerenciar IPs (Master apenas)
- `/admin/contatos` - Gerenciar contatos

## Suporte

Este é um sistema simplificado baseado no sistema original TratorBR. Para dúvidas ou suporte, consulte a documentação original ou entre em contato através do formulário de contato do sistema.

