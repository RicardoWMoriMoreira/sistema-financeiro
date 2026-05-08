# Deploy em produção

Este projeto está preparado para o seguinte fluxo:

- Frontend: Vercel
- Backend: Render
- Banco de dados: PostgreSQL gerenciado pelo Render

## 1. Pré-requisitos

- Repositório publicado no GitHub.
- Conta na Vercel.
- Conta no Render.
- Variáveis secretas geradas com valores fortes.

Para gerar segredos:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

## 2. Backend + PostgreSQL no Render

1. Acesse o Render.
2. Crie um novo Blueprint usando o arquivo `render.yaml` da raiz do repositório.
3. Confirme a criação dos recursos:
   - `sistema-financeiro-api`
   - `sistema-financeiro-db`
4. Configure a variável `CORS_ORIGINS` no serviço `sistema-financeiro-api`.

Durante o primeiro deploy, pode usar temporariamente:

```env
CORS_ORIGINS=https://seu-projeto.vercel.app
```

Depois de publicar o frontend, volte no Render e troque para a URL final da Vercel.

O Render irá:

- instalar as dependências do backend;
- criar o banco PostgreSQL;
- injetar `DATABASE_URL`;
- gerar `SECRET_KEY`;
- executar `alembic upgrade head`;
- iniciar a API com Uvicorn.

Valide a API:

```powershell
Invoke-WebRequest https://sua-api.onrender.com/health
```

## 3. Frontend na Vercel

1. Acesse a Vercel.
2. Importe o mesmo repositório do GitHub.
3. Configure o Root Directory como:

```text
frontend
```

4. Configure as variáveis de ambiente:

```env
NEXT_PUBLIC_API_URL=https://sua-api.onrender.com
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=valor-forte-gerado
```

5. Faça o deploy.

## 4. Ajuste final de CORS

Depois que a Vercel gerar a URL final do frontend, volte ao Render e defina:

```env
CORS_ORIGINS=https://seu-projeto.vercel.app
```

Se usar domínio próprio:

```env
CORS_ORIGINS=https://www.seu-dominio.com
```

## 5. Smoke test pós-deploy

Valide no navegador:

- cadastro de usuário;
- login;
- dashboard;
- listagem de categorias;
- criação de categoria;
- criação de transação;
- resumo financeiro.

Valide a API:

```powershell
Invoke-WebRequest https://sua-api.onrender.com/health
```

## 6. Observações importantes

- O banco local SQLite (`backend/finance.db`) não é enviado automaticamente para o PostgreSQL.
- Se houver dados reais no SQLite, será necessário fazer uma migração de dados separada.
- O plano gratuito do Render pode hibernar a API após inatividade, deixando o primeiro acesso mais lento.
- Para produção real com usuários, prefira domínio próprio e HTTPS nas duas pontas.
