# API Node.js com Express e MongoDB

API RESTful construída com Node.js, Express e MongoDB, para consumo da aplicação frontend.

## Tecnologias

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web para Node.js
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM (Object Document Mapper) para MongoDB
- **JWT** - JSON Web Token para autenticação
- **Bcrypt** - Criptografia de senhas

## Requisitos

- Node.js
- MongoDB (local ou remoto)
- NPM ou Yarn

## Estrutura do Projeto

```
project-root/
├── src/
│   ├── config/             # Configurações da aplicação
│   ├── controllers/        # Controladores de rotas
│   ├── middlewares/        # Middlewares personalizados
│   ├── models/             # Modelos do MongoDB
│   ├── routes/             # Definição de rotas
│   ├── services/           # Lógica de negócio
│   ├── utils/              # Funções utilitárias
│   └── app.js              # Configuração do Express
├── .env                    # Variáveis de ambiente
├── .gitignore
├── package.json
├── README.md
└── server.js              # Ponto de entrada da aplicação
```

## Instalação e Configuração do servidor

1. Clone o repositório:

```bash
git clone https://github.com/guilherme-lucke/certificadora-3
cd certificadora-3
cd backend
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`:

```bash
cp .env.example .env
```

## Banco de Dados

### MongoDB Atlas (Nuvem)

1. Crie uma conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Configure um cluster gratuito
3. Obtenha a string de conexão e atualize no arquivo `.env`
4. Adicione seu IP atual à lista de IPs permitidos no Atlas

## Iniciando o Servidor

### Modo Desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

### Modo Produção

```bash
npm start
# ou
yarn start
```

O servidor estará disponível em `http://localhost:3000` (ou na porta definida no arquivo `.env`).
