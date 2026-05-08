# Sistema Financeiro

[![CI](https://github.com/YOUR_USERNAME/sistema-financeiro/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/sistema-financeiro/actions/workflows/ci.yml)

Sistema de gerenciamento financeiro com backend em FastAPI e frontend em Next.js.

## Estrutura do Projeto

```
sistema-financeiro/
├── backend/          # API FastAPI (Python)
├── frontend/         # Interface Next.js (React)
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Pré-requisitos

- Python 3.11+
- Node.js 20+
- Docker e Docker Compose (opcional)

## Desenvolvimento

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up -d
```

## Configuração para produção

Antes do deploy, copie os exemplos de ambiente e defina valores reais:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Variáveis obrigatórias para produção:

- `SECRET_KEY`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_API_URL`
- `CORS_ORIGINS`

Para publicar com frontend na Vercel e backend + PostgreSQL no Render, siga o guia em [`DEPLOY.md`](DEPLOY.md).

## Testes

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm test
```

## CI/CD

O projeto utiliza GitHub Actions para integração contínua. O workflow executa automaticamente em push e pull requests para as branches `main` e `master`:

- **Backend**: Testes com pytest
- **Frontend**: Linting, testes e build de produção

---

> **Nota**: Substitua `YOUR_USERNAME` nas badges pelo seu nome de usuário do GitHub.
