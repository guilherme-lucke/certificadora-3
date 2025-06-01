# Projeto Meninas Digitais UTFPR-CP - Sistema de Gerenciamento de Inscrições

## 1. Informações da Equipe

### Alunos Participantes do Desenvolvimento:

*   Guilherme Grilo Luche (Líder e Frontend Developer)
*   Bernardo Seabra (Frontend Developer)
*   Gustavo Luiz Conceição Zago (Frontend Developer)
*   Fernando Santos Nascimento (Backend Developer)

---

## 2. Objetivo do Sistema

O sistema de gerenciamento de inscrições para o projeto Meninas Digitais UTFPR-CP tem como objetivo principal facilitar e organizar o processo de divulgação de atividades e inscrição das estudantes do ensino fundamental e médio de escolas públicas. A plataforma visa centralizar as informações, otimizar o tempo da equipe do projeto e proporcionar uma experiência mais fluida para as participantes, além de permitir o gerenciamento de diferentes tipos de usuários (Estudantes, Admins, SuperAdmins) e suas respectivas permissões.

---

## 3. Funcionalidades Desenvolvidas para Avaliação

O sistema implementa as seguintes funcionalidades principais:

1.  **Autenticação e Gerenciamento de Contas de Usuário:**
    *   Cadastro de Estudantes (com consentimento LGPD).
    *   Login/Logout para todos os papéis (Estudante, Admin, SuperAdmin).
    *   Recuperação de Senha ("Esqueci Minha Senha" via e-mail, testável com Mailtrap).
    *   Gerenciamento de Perfil (Estudante): Visualização/edição de dados, alteração de senha.
2.  **Gerenciamento de Atividades:**
    *   Visualização Pública de atividades publicadas.
    *   Criação, Listagem, Edição e Exclusão de Atividades (Admin/SuperAdmin).
    *   Gerenciamento de Status de Atividades (Admin/SuperAdmin).
3.  **Sistema de Inscrição em Atividades:**
    *   Inscrição por Estudantes em atividades disponíveis (com validação de vagas).
    *   Gerenciamento de Inscrições (Estudante): Visualização e cancelamento de inscrições.
    *   Visualização de Inscritos por Atividade (Admin/SuperAdmin).
    *   Histórico de Participação (Estudante).
4.  **Gerenciamento de Papéis e Permissões (RBAC):**
    *   Diferenciação de acesso e funcionalidades para os papéis Estudante, Admin e SuperAdmin.
    *   SuperAdmin: Gerenciamento completo de contas de Estudantes e Admins (criar Admins, ativar/desativar contas, etc.).
5.  **Conformidade com LGPD (Básico):**
    *   Política de Privacidade, coleta de consentimento, solicitação de exclusão de conta por estudante.

---

## 4. Ferramentas e Tecnologias Utilizadas

### 4.1. Codificação, Compilação e Execução:

*   **Linguagem Principal (Backend):** JavaScript (Node.js)
    *   **Versão Node.js:** LTS (ex: v18.x.x ou v20.x.x). [Link: Node.js](https://nodejs.org/)
*   **Framework Backend:** Express.js
    *   **Versão:** ^4.18.x (Recomendado) ou ^5.x.x (Beta - conforme `package.json`). [Link: Express.js](https://expressjs.com/)
*   **Linguagem Principal (Frontend):** JavaScript (React)
    *   **Framework Frontend:** React.js
        *   **Versão:** ^18.x.x ou ^19.x.x (conforme `package.json`). [Link: React.js](https://reactjs.org/)
    *   **Build Tool (Frontend):** Vite
        *   **Versão:** ^5.x.x ou ^6.x.x (conforme `package.json`). [Link: Vite](https://vitejs.dev/)
*   **Ambiente de Desenvolvimento Integrado (IDE):** Visual Studio Code (VS Code)
    *   **Versão:** Mais recente. [Link: VS Code](https://code.visualstudio.com/)
*   **Controle de Versão:** Git
    *   **Versão:** Mais recente. [Link: Git](https://git-scm.com/)

### 4.2. Base de Dados:

*   **Sistema de Gerenciamento de Banco de Dados (SGBD):** MongoDB (NoSQL)
    *   **Hospedagem/Serviço:** MongoDB Atlas (Cloud Service). [Link: MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    *   **ODM (Node.js):** Mongoose
        *   **Versão:** ^8.x.x (conforme `package.json`). [Link: Mongoose](https://mongoosejs.com/)

### 4.3. Bibliotecas e Ferramentas Complementares (Principais):
* **Backend:** 
	* `dotenv`: Gerenciamento de variáveis de ambiente.
	* `jsonwebtoken`: Geração e verificação de tokens JWT.
	* `bcryptjs`: Hashing de senhas (verifique a versão no seu `package.json`, ex: `^2.4.3`).
	* `cors`: Habilitação de Cross-Origin Resource Sharing. 
	* `express-validator`: Validação de requests. 
	* `nodemailer`: Envio de e-mails (para "Esqueci Senha"). 
	* `nodemon` (Desenvolvimento): Reinício automático do servidor.
* **Frontend:**
	* `react-router-dom`: Roteamento no cliente.
	* `axios`: Requisições HTTP.
	* `tailwindcss`: Estilização CSS utility-first.
	* `react-icons`: Ícones.
* **Teste de E-mail (Desenvolvimento):** 
	* **Ferramenta:** Mailtrap.io (ou similar)
		* **Versão:** N/A (Serviço Web). [Link: Mailtrap.io](https://mailtrap.io/)

---

## 5. Roteiro para Configurar e Executar o Sistema

_**Link para o Vídeo de Instalação e Execução:** [COLOQUE_AQUI_O_LINK_PARA_O_VÍDEO_NO_YOUTUBE_OU_SIMILAR]

### 5.1. Pré-requisitos de Instalação:

1.  Instale **Node.js** (versão LTS) e **Git** conforme links na seção 4.1.
2.  Crie uma conta gratuita no **MongoDB Atlas** (seção 4.2).
3.  (Opcional, para testar envio de e-mail) Crie uma conta gratuita no **Mailtrap.io** (seção 4.3).

### 5.2. Configuração da Base de Dados (MongoDB Atlas):

1.  **Crie um Cluster:** No MongoDB Atlas, crie um cluster gratuito (tier M0).
2.  **Crie um Usuário de Banco de Dados:** Em "Database Access", crie um novo usuário (ex: `user_meninas`) com uma senha forte. Anote as credenciais.
3.  **Permita Acesso de Rede:** Em "Network Access", clique em "ADD IP ADDRESS" e depois em "ALLOW ACCESS FROM ANYWHERE" (ou adicione seu IP específico). Confirme.
4.  **Obtenha a String de Conexão:**
    *   No seu cluster, clique em "Connect" -> "Drivers".
    *   Copie a string de conexão. Exemplo: `mongodb+srv://<username>:<password>@clustername.mongodb.net/<dbname>?retryWrites=true&w=majority`.
    *   Substitua `<username>` pelo usuário criado (ex: `user_meninas`), `<password>` pela senha dele, e defina um `<dbname>` (ex: `meninas_digitais_db`).
    *   **Guarde esta string completa.**

### 5.3. Configuração do Backend:

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/guilherme-lucke/certificadora-3.git
    cd certificadora-3/backend
    ```
2.  **Instale as Dependências:**
    ```bash
    npm install
    ```
3.  **Crie o Arquivo de Variáveis de Ambiente (`.env`):**
    *   Na pasta `backend/`, crie um arquivo chamado `.env`.
    *   Adicione o seguinte conteúdo, **substituindo pelos seus valores**:
        ```env
        NODE_ENV=development
        PORT=5000
        MONGO_URI=SUA_STRING_DE_CONEXAO_COMPLETA_DO_MONGODB_ATLAS
        JWT_SECRET=definaUmSegredoForteParaSeusTokensJWT
        JWT_EXPIRES_IN=1d

        # Credenciais do Mailtrap (obtenha da sua inbox no Mailtrap.io -> SMTP Settings -> Integrations -> Nodemailer)
        EMAIL_HOST=smtp.mailtrap.io
        EMAIL_PORT=2525 # Ou a porta indicada pelo Mailtrap
        EMAIL_USER=SEU_USERNAME_MAILTRAP
        EMAIL_PASS=SUA_PASSWORD_MAILTRAP
        EMAIL_FROM="Meninas Digitais App <noreply@example.com>"
        ```
4.  **(Recomendado) Execute o Script de Seed para Popular o Banco:**
    ```bash
    npm run seed:users
    # Para popular com mais dados (atividades, etc., se os scripts existirem):
    # npm run seed:all
    ```
5.  **Inicie o Servidor Backend:**
    ```bash
    npm run dev
    ```
    O backend deverá estar rodando em `http://localhost:5000` (ou a porta definida no `.env`).

### 5.4. Configuração do Frontend:

1.  **Abra um NOVO terminal.**
2.  **Navegue até a Pasta do Frontend:**
    ```bash
    cd certificadora-3/frontend 
    # Se estiver na raiz do projeto 'certificadora-3'
    ```
3.  **Instale as Dependências:**
    ```bash
    npm install
    ```
4.  **(Opcional, mas recomendado) Crie o Arquivo de Variáveis de Ambiente (`.env.local`):**
    *   Na pasta `frontend/`, crie um arquivo chamado `.env.local`.
    *   Adicione a URL base da API do backend:
        ```env
        VITE_API_BASE_URL=http://localhost:5000/api/v1 # Use a porta correta do seu backend
        ```
5.  **Inicie a Aplicação Frontend:**
    ```bash
    npm run dev
    ```
    O frontend deverá estar rodando em `http://localhost:5173` (ou a porta informada pelo Vite). Abra este endereço no seu navegador.

---

## 6. Roteiro para Testar o Sistema

**Contas de Acesso Padrão (se o script `seed:users` foi executado):**

*   **SuperAdmin:**
    *   E-mail: `superadmin@meninasdigitais.com`
    *   Senha: `SuperAdmin123!`
*   **Admin:**
    *   E-mail: `admin@meninasdigitais.com`
    *   Senha: `Admin123!`
*   **Estudante:**
    *   E-mail: `estudante@email.com`
    *   Senha: `Estudante123!`

*(Se o seed não foi executado, cadastre-se como estudante. Para papéis de Admin/SuperAdmin, o campo `role` do usuário precisará ser alterado manualmente no MongoDB Atlas após o cadastro inicial).*

**Fluxos de Teste Sugeridos:**

1.  **Visão Geral e Cadastro:** Acesse a aplicação frontend. Explore a página inicial. Cadastre uma nova estudante.
2.  **Login e Perfil Estudante:** Faça login como estudante. Acesse "Minha Área", visualize/edite o perfil, altere a senha.
3.  **Gerenciamento de Atividades (Admin):** Faça login como Admin. Em "Minha Área", crie, edite, publique uma atividade.
4.  **Inscrição em Atividade (Estudante):** Faça login como estudante. Inscreva-se na atividade publicada. Visualize e cancele a inscrição em "Minhas Inscrições".
5.  **Visualização de Inscritos (Admin):** Faça login como Admin. Visualize os inscritos na atividade.
6.  **Gerenciamento de Usuários (SuperAdmin):** Faça login como SuperAdmin. Em "Minha Área", liste/edite estudantes e crie/liste/edite/remova Admins.
7.  **Recuperação de Senha:** Na tela de login, use "Esqueci Minha Senha". Verifique o Mailtrap.io pelo e-mail e siga o link para redefinir.
8.  **Exclusão de Conta LGPD (Estudante):** Faça login como estudante. No perfil, solicite a exclusão da conta.

---
