<div align="center">
  <img 
    alt="Logo Explorer" 
    title="Explorer" 
    src="https://i.imgur.com/jgM1K5Z.png"
  >

  <br>

  <h2 align="center">
    API REST com NodeJS
  </h2>
</div>
<br>

# DAILY DIET API
API desenvolvida para registrar todas as refeições que um usuário fizer durante o seu dia.

Quando o usuário se registra, um cookie é criado e armazenado. Utilizamos esse cookie para validar o registro, adicionando-o na coluna "session_id" da tabela "user". Depois, usamos esse identificador para validar o usuário que está adicionando uma nova refeição, de modo que possamos adicionar o ID do usuário na tabela "meal".

Tópicos abordados:`Typescript`, `ESLint`, `Banco de dados - Knex, migrations, querys`,`Variáveis de ambiente`,`Validação de dados - ZOD`, `Fastify - Plugins, cookies e prehandlers`, `Testes automatizados - Tipos de testes, vitest, supertest`, `Build do projeto - TSUP` e `Deploy da aplicação`

## Regras da aplicação

  - [x] Deve ser possível criar um usuário
  - [x] Deve ser possível identificar o usuário entre as requisições
  - [x] Deve ser possível registrar uma refeição feita, com as seguintes informações:  
      - Nome
      - Descrição
      - Data e Hora
      - Está dentro ou não da dieta
  - [x] Deve ser possível editar uma refeição, podendo alterar todos os dados acima
  - [x] Deve ser possível apagar uma refeição
  - [x] Deve ser possível listar todas as refeições de um usuário
  - [x] Deve ser possível visualizar uma única refeição
  - [x] Deve ser possível recuperar as métricas de um usuário
      - Quantidade total de refeições registradas
      - Quantidade total de refeições dentro da dieta
      - Quantidade total de refeições fora da dieta
      - Melhor sequência por dia de refeições dentro da dieta
  - [x] O usuário só pode visualizar, editar e apagar as refeições o qual ele criou

## Instalação

```bash
# Faça o clone do repotório
  gh repo clone RennanPereira/Daily-diet-API

# Instalar as dependências do projeto
  npm install

# Executando o projeto no ambiente de desenvolvimento
  npm run dev
  
# Rodar as migrations do projeto para criar o banco de dados
  npm run knex -- migrate:latest
```
## Rotas
- Criar novo usuário
```bash
POST /user
```

- Criar novo registro de refeição
```bash
POST /meal
```

- Listar todas refeições registradas pelo usuário
```bash
GET /meal
```

- Listar uma refeição específica registrada pelo usuário
```bash
GET /meal/:id
```

- Mostrar um resumo geral das refeições cadastradas pelo usuário (total de refeições, refeições dentro da dieta e refeições fora da dieta)
```bash
GET /meal/summary
```

- Deletar uma refeição cadastrada
```bash
DELETE /meal/:id
```

- Editar uma refeição cadastrada
```bash
PUT /meal/:id
```

## Testes automatizados e2e
  - [x] Should be able to create a new user
  - [x] Should be able to create a new meal
  - [x] Should be able to list all meals
  - [x] Should be able to get a specific meal
  - [x] Should be able to delete a meal
  - [x] Should be able to get the summary
  - [x] Should be able to update a meal
