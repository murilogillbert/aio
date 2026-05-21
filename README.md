# AIO All In One White Label

Monorepo do sistema AIO para clinicas e consultorios premium em formato white label.

## Status

- Fase 1: front-end React/Vite com mock data, rotas navegaveis, autenticacao simulada, fluxo de agendamento e design white label dinamico.
- Fase 2: backend .NET 10 com SQL Server em Docker, Entity Framework Core, migration inicial, seeds equivalentes aos mocks e script SQL versionado.
- Fase 3: front-end integrado a API real, JWT com refresh token, endpoints de catalogo, agendamento, recrutamento, metricas, configuracoes white label, stubs de integracoes e jobs de background.

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

## Como rodar o banco e backend

```bash
docker compose up -d sqlserver
cd backend
dotnet tool restore
dotnet ef database update --project Aio.Infrastructure/Aio.Infrastructure.csproj --startup-project Aio.Api/Aio.Api.csproj
dotnet run --project Aio.Api/Aio.Api.csproj --urls http://127.0.0.1:5088
```

O SQL Server publica a porta local `14330` para evitar conflito com instancias locais na `1433`.

## Credenciais de teste

| Role | E-mail | Senha |
| --- | --- | --- |
| Paciente | `paciente@aio.com` | `senha123` |
| Profissional | `profissional@aio.com` | `senha123` |
| Recepcao | `recepcao@aio.com` | `senha123` |
| Admin | `admin@aio.com` | `senha123` |

## Arquitetura

- `frontend/src/mocks`: dados white label, servicos, profissionais, usuarios, agenda, metricas, vagas e custos.
- `frontend/src/services/api.ts`: camada mockada com `Promises` e atraso artificial de 300 a 600ms.
- `frontend/src/context/ConfigContext.tsx`: configuracoes white label e variaveis CSS dinamicas.
- `frontend/src/context/AuthContext.tsx`: autenticacao fake via `localStorage`, token simulado e redirect por role.
- `backend/Aio.Api`: controllers e configuracao HTTP.
- `backend/Aio.Application`: interfaces e services.
- `backend/Aio.Domain`: entidades de dominio.
- `backend/Aio.Infrastructure`: EF Core, DbContext, repositories, migrations e seeds.
- `backend/Scripts/001_initial_create.sql`: script SQL idempotente da migration inicial.
- `backend/Scripts/002_phase3_auth_and_integration.sql`: script SQL idempotente para refresh tokens da fase 3.
- `docker-compose.yml`: SQL Server funcional com volume persistente.

## Rotas principais

Publicas: `/`, `/servicos`, `/servicos/:id`, `/profissionais`, `/profissionais/:id`, `/sobre`, `/vagas`, `/login`, `/cadastro`, `/agendar`.

Paciente: `/minha-conta`, `/minha-conta/agendamentos`, `/minha-conta/dependentes`, `/minha-conta/mensagens`, `/minha-conta/perfil`.

Profissional: `/profissional`, `/profissional/agenda`, `/profissional/metricas`, `/profissional/mensagens`.

Recepcao: `/recepcao`, `/recepcao/agenda`, `/recepcao/mensagens`, `/recepcao/servicos`, `/recepcao/profissionais`.

Admin: `/admin`, `/admin/profissionais`, `/admin/servicos`, `/admin/recrutamento`, configuracoes white label e paineis de metricas.

## White label

Nenhum componente do front fixa nome, logo, paleta ou conteudo institucional. A configuracao inicial vem de `frontend/src/mocks/config.ts`; na fase 2, as mesmas configuracoes tambem estao seedadas na tabela `configuracoes`.
