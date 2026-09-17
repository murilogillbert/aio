# AIO All In One White Label

Monorepo do sistema AIO para clinicas e consultorios premium em formato white label.

## Stack

- **Front-end**: React 19 + Vite + TypeScript, hospedado na Vercel ([www.psicologiaeexistir.com.br](https://www.psicologiaeexistir.com.br/)).
- **Back-end**: Node.js + Express + TypeScript, rodando como função serverless na Vercel ([aio-63dv.vercel.app](https://aio-63dv.vercel.app/)).
- **Banco de dados**: PostgreSQL gerenciado pelo Supabase, acessado via Prisma ORM.
- **Storage**: bucket `uploads` do Supabase Storage, para anexos de prontuário e afins.

Documentação completa de arquitetura, fluxo e deploy em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Como rodar o front-end

```bash
cd frontend
npm install
npm run dev
```

O Vite abre em `http://localhost:5173`.

Configure `frontend/.env` se quiser mudar a URL da API:

```bash
VITE_API_URL=http://127.0.0.1:5088/api
```

## Como rodar o backend

```bash
cd backend
npm install
cp .env.example .env   # preencha com as credenciais do seu projeto Supabase
npm run prisma:push    # cria o schema no Postgres do Supabase
npm run seed           # popula dados de demonstração
npm run dev            # inicia a API em http://127.0.0.1:5088
```

Variáveis necessárias em `backend/.env`: `DATABASE_URL`/`DIRECT_URL` (Postgres do Supabase, pooler 6543/5432), `SUPABASE_URL`/`SUPABASE_SECRET_KEY`/`SUPABASE_STORAGE_BUCKET` (Storage), `JWT_*` (assinatura dos tokens da API) e `CORS_ORIGINS` (domínio da Vercel, quando publicado).

## Credenciais de teste

| Role | E-mail | Senha |
| --- | --- | --- |
| Paciente | `paciente@aio.com` | `senha123` |
| Profissional | `profissional@aio.com` | `senha123` |
| Recepcao | `recepcao@aio.com` | `senha123` |
| Admin | `admin@aio.com` | `senha123` |

## Arquitetura

- `frontend/src/mocks`: dados legados da fase 1 (mock), mantidos apenas como referência histórica — não são mais usados pelas telas reais.
- `frontend/src/services/api.ts`: camada de acesso à API Express real.
- `frontend/src/context/ConfigContext.tsx`: configuracoes white label e variaveis CSS dinamicas.
- `frontend/src/context/AuthContext.tsx`: autenticacao via JWT emitido pelo backend, com refresh token.
- `backend/src/routes`: rotas Express, uma por domínio (auth, catálogo, agenda, agendamentos, pacientes, prontuários, métricas, admin, serviços, clínica/integrações, uploads etc).
- `backend/src/dto`: mapeamento entre o schema Prisma e os contratos JSON esperados pelo front.
- `backend/prisma/schema.prisma`: schema completo do Postgres (Supabase).
- `backend/prisma/seed.ts`: seed de demonstração (usuários de teste, catálogo, agenda, white-label etc).

## Rotas principais

Publicas: `/`, `/servicos`, `/servicos/:id`, `/profissionais`, `/profissionais/:id`, `/sobre`, `/vagas`, `/login`, `/cadastro`, `/agendar`.

Paciente: `/minha-conta`, `/minha-conta/agendamentos`, `/minha-conta/dependentes`, `/minha-conta/mensagens`, `/minha-conta/perfil`.

Profissional: `/profissional`, `/profissional/agenda`, `/profissional/metricas`, `/profissional/mensagens`.

Recepcao: `/recepcao`, `/recepcao/agenda`, `/recepcao/mensagens`, `/recepcao/servicos`, `/recepcao/profissionais`.

Admin: `/admin`, `/admin/profissionais`, `/admin/servicos`, `/admin/recrutamento`, configuracoes white label e paineis de metricas.

## White label

Nenhum componente do front fixa nome, logo, paleta ou conteudo institucional. A configuracao inicial vem do seed (`backend/prisma/seed.ts`), gravada na tabela `AppSetting` e servida por `GET /api/configuracoes`.

## Deploy

- **Front-end (Vercel)**: projeto apontando para `frontend/`, build `npm run build`. Variável `VITE_API_URL` (lida em build time) aponta para a URL pública do backend, ex. `https://aio-63dv.vercel.app/api`.
- **Backend (Vercel, serverless)**: projeto apontando para `backend/`, entry point `backend/api/index.ts` (exporta o `app` Express sem `listen()`). Variáveis obrigatórias: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_STORAGE_BUCKET`, `JWT_SIGNING_KEY` e `CORS_ORIGINS` (domínio do front).
- **Banco**: Supabase Postgres, gerenciado direto pelo painel do Supabase.

Detalhes completos em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md#7-implantação-deploy).
