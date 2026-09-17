# Arquitetura do AIO

Documentação técnica do monorepo AIO (plataforma white-label para clínicas). Este
documento complementa os READMEs de [`frontend/`](../frontend) e [`backend/`](../backend/README.md)
com uma visão de conjunto: estrutura, fluxo de dados, autenticação, banco de dados
e implantação.

## 1. Visão geral

O AIO é uma plataforma white-label de agendamento e gestão para clínicas
(inicialmente operando como **Psicologia E Existir**). Um único código-fonte
frontend/backend atende múltiplos perfis de usuário:

- **Público**: visitantes do site institucional, agendamento online.
- **Paciente**: área logada com agendamentos, dependentes, mensagens.
- **Profissional**: agenda própria, prontuário, métricas, mensagens.
- **Recepção**: agenda geral, cadastro de pacientes, prontuários, serviços.
- **Admin**: configuração white-label (tema, sobre, banners), profissionais,
  serviços, recrutamento, integrações externas e métricas gerenciais.

Não há multi-tenant real hoje — é uma instância única, mas o front não fixa
nome/logo/cores em nenhum componente: tudo vem de `GET /api/configuracoes`
(tabela `AppSetting`), o que permite reaproveitar o código para outras clínicas
no futuro.

### Stack

| Camada    | Tecnologia                                                        |
| --------- | ------------------------------------------------------------------ |
| Frontend  | React 19 + Vite 6 + TypeScript, Tailwind CSS, React Router 6       |
| Backend   | Node.js + Express 4 + TypeScript, rodando como função serverless   |
| ORM       | Prisma 6 (`@prisma/client`)                                       |
| Banco     | PostgreSQL gerenciado pelo Supabase (via pooler PgBouncer)         |
| Storage   | Supabase Storage, bucket `uploads`                                 |
| Auth      | JWT próprio (access + refresh token), bcrypt para senhas           |
| Deploy    | Vercel (dois projetos separados: frontend e backend)               |

## 2. Estrutura do repositório

```
aio/
├── frontend/                  # SPA React (Vite)
│   ├── src/
│   │   ├── pages/{public,patient,professional,reception,admin,shared}/
│   │   ├── components/        # Header, Footer, layouts, UI kit (ui.tsx), mapa (Leaflet)
│   │   ├── context/           # AuthContext, ConfigContext, ToastContext
│   │   ├── hooks/              # use* hooks de dados (agenda, agendamentos, catálogo, métricas, pacientes, prontuário)
│   │   ├── services/api.ts    # única camada de acesso HTTP à API
│   │   ├── mocks/              # dados legados da fase 1 — não usados em produção
│   │   └── types.ts            # tipos compartilhados do domínio no front
│   └── vercel.json             # rewrite SPA (tudo cai em /index.html)
│
├── backend/                    # API Express
│   ├── api/index.ts            # entry point serverless (Vercel) — exporta `app`, sem `listen()`
│   ├── src/
│   │   ├── index.ts            # entry point local (`npm run dev`) — chama `app.listen()` e importa os jobs
│   │   ├── app.ts              # monta CORS + todas as rotas Express
│   │   ├── db.ts                # instancia única do PrismaClient
│   │   ├── env.ts               # leitura/validação de variáveis de ambiente
│   │   ├── routes/*.ts          # um arquivo por domínio (ver seção 4)
│   │   ├── dto/*.ts             # mapeamento entre modelos Prisma e contratos JSON do front
│   │   ├── lib/*.ts             # JWT, hash de senha, datas, conflito de horário, período de métricas, cliente Supabase
│   │   ├── middleware/          # requireAuth / requireRole, error handler central
│   │   └── jobs/                # heartbeats (setInterval) — ver observação na seção 4.6
│   ├── prisma/schema.prisma     # schema completo do Postgres
│   ├── prisma/seed.ts           # dados de demonstração / bootstrap
│   └── vercel.json              # rewrite: toda rota cai na function `/api`
│
├── docs/ARQUITETURA.md          # este documento
└── README.md                    # guia rápido de setup local
```

## 3. Frontend

### 3.1 Roteamento (`src/App.tsx`)

Definido com `react-router-dom`. Layout público (`Header`/`Footer`) para rotas
abertas; layouts internos (`InternalLayout` com sidebar) por perfil, protegidos
por `RequireRole`, que redireciona para `/login` (não autenticado) ou `/403`
(role errada) usando o `AuthContext`.

Grupos de rota: público (`/`, `/servicos`, `/profissionais`, `/sobre`, `/vagas`,
`/login`, `/cadastro`, `/agendar`), paciente (`/minha-conta/*`), profissional
(`/profissional/*`), recepção (`/recepcao/*`) e admin (`/admin/*`, incluindo
sub-rotas de configuração white-label e métricas).

### 3.2 Estado e dados

- **`context/AuthContext.tsx`**: guarda `user`/`token`/`refreshToken` em
  `localStorage` (`aio-auth`); expõe `login`, `register`, `logout`.
- **`context/ConfigContext.tsx`**: busca `GET /api/configuracoes` no boot e
  aplica o tema (cores, fontes) como CSS custom properties em `:root`, além de
  definir `document.title`.
- **`services/api.ts`**: única porta de saída HTTP. Helper `request()` injeta
  `Authorization: Bearer <token>` automaticamente e lança erro para respostas
  não-OK. `VITE_API_URL` define a base (default `http://127.0.0.1:5088/api`
  em dev).
- **`hooks/use*.ts`**: hooks finos por domínio (agenda, agendamentos,
  catálogo, métricas, pacientes, prontuário) que encapsulam
  `loading`/`error`/`reload` em cima das funções de `services/api.ts`.

`src/mocks/*` é resíduo da fase 1 do projeto (protótipo sem backend) e **não é
mais consumido** pelas telas reais — mantido só como referência histórica.

## 4. Backend

### 4.1 Dois entry points

O backend roda em dois "modos" a partir do mesmo `app.ts`:

- **Local** (`src/index.ts`, script `npm run dev`): chama `app.listen()` e
  importa os *jobs* de heartbeat.
- **Serverless na Vercel** (`api/index.ts`): exporta o `app` do Express
  diretamente, sem `listen()` — a Vercel cuida do ciclo de vida da requisição.
  Os jobs de `setInterval` propositalmente **não** são importados aqui (não
  fazem sentido em um processo que só vive durante uma requisição).

`backend/vercel.json` reescreve todas as rotas para a function `/api`, ou
seja, `api/index.ts` é o único ponto de entrada em produção.

### 4.2 Middlewares globais (`src/app.ts`)

- **CORS customizado**: normaliza a `Origin` removendo barra final e libera
  automaticamente `localhost`/`127.0.0.1` (qualquer porta) + qualquer origem
  listada em `CORS_ORIGINS` (também normalizada sem barra final). Essa
  tolerância a barra final foi endurecida no commit `cc47f91`.
- **`express.json()`** para parse de body.
- **`errorHandler`** central, montado por último, converte erros lançados via
  `src/lib/httpError.ts` em respostas HTTP consistentes.

### 4.3 Autenticação (`routes/auth.ts`, `lib/token.ts`, `middleware/auth.ts`)

JWT próprio — **não usa o Supabase Auth**. Fluxo:

1. `POST /api/auth/cadastro` ou `/api/auth/login`: valida credenciais
   (bcrypt), emite `token` (access, expira em `JWT_ACCESS_TOKEN_MINUTES`,
   default 60 min) + `refreshToken` (valor aleatório, expira em
   `JWT_REFRESH_TOKEN_DAYS`, default 14 dias). O refresh token é armazenado no
   banco (`RefreshToken`) só como **hash SHA-256** (`tokenHash`), nunca em
   texto puro.
2. `POST /api/auth/refresh`: troca um refresh token válido por um novo par
   (rotação — o antigo é marcado `revokedAt`/`replacedByTokenHash`).
3. Requisições autenticadas enviam `Authorization: Bearer <access token>`.
   `requireAuth` valida assinatura/issuer/audience e popula `req.user`
   (`id`, `email`, `fullName`, `role`). `requireRole(...roles)` restringe por
   papel.

Papéis (`Role`/`UserRole` no schema, N:N mas usado como 1:1 na prática):
`paciente`, `profissional`, `recepcao`, `admin`.

### 4.4 Rotas HTTP (`src/routes/*.ts`, montadas em `app.ts`)

| Prefixo                | Arquivo                  | Domínio                                                                 |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------ |
| `/api/auth`             | `auth.ts`                 | login, cadastro, refresh                                                 |
| `/api/catalogo`         | `catalog.ts`               | serviços e profissionais públicos (vitrine)                             |
| `/api/agenda`           | `agenda.ts`                | slots disponíveis + criação de agendamento público (`/agendar`)          |
| `/api/agendamentos`     | `appointments.ts`          | CRUD completo de agendamentos, status, check-in, pagamento, recorrência  |
| `/api/bloqueios`        | `blocks.ts`                | bloqueios de agenda por profissional                                     |
| `/api/pacientes`        | `patients.ts`               | CRUD de pacientes (recepção/admin)                                       |
| `/api/prontuarios`      | `medicalRecords.ts`         | prontuário, evoluções (SOAP), assinatura, anexos                        |
| `/api/metricas`         | `metrics.ts`                 | dashboard, faturamento, ranking de profissionais/serviços, movimento     |
| `/api/configuracoes`    | `config.ts`                 | leitura/escrita das configurações white-label (`AppSetting`)             |
| `/api/admin/servicos`   | `services.ts`               | CRUD admin de serviços (mais completo que o `catalogo` público)          |
| `/api/admin/clinica`    | `clinic.ts`                 | dados da clínica + integrações (ver 4.5)                                 |
| `/api/admin`            | `admin.ts`                  | usuários + CRUD genérico (`/crud/:resource`) para planos, categorias etc |
| `/api/integracoes`      | `integrations.ts`           | status agregado das integrações (somente leitura, admin)                 |
| `/api/jobs`             | `jobs.ts`                    | status dos jobs de heartbeat (somente leitura, admin)                    |
| `/api/recrutamento`     | `recruitment.ts`            | vagas e candidaturas                                                     |
| `/api/uploads`          | `uploads.ts`                 | upload de arquivo (multer, memória) → Supabase Storage                  |

Todas as rotas fora de `auth`/`catalogo`/`agenda` (leitura pública) exigem
`requireAuth`, e a maioria também `requireRole(...)`.

### 4.5 Camada DTO (`src/dto/*.ts`)

Cada arquivo mapeia entidades Prisma (nomes/tipos internos, decimais, enums em
português) para o formato JSON esperado pelo front (`frontend/src/types.ts`).
Isso mantém o schema do banco livre para evoluir sem quebrar contrato de API,
e centraliza regras como "quais campos sensíveis nunca voltam pro cliente"
(ex.: `buildSafeUser` em `dto/user.ts` nunca inclui `passwordHash`).

Destaque: `dto/clinic.ts` cuida do modelo `Clinic`, que guarda credenciais de
integrações externas (Gmail, Pub/Sub, Mercado Pago, WhatsApp Business, SMTP,
Resend, Instagram) — hoje armazenadas em texto simples nas colunas do Postgres
(ver seção 7, pontos de atenção).

### 4.6 Jobs (`src/jobs/*.ts`)

`metricsSnapshot.ts` e `notificationDispatch.ts` são **stubs**: apenas um
`setInterval` com `console.debug`, sem lógica real de disparo (paridade com
uma versão anterior hospedada). Só rodam no processo local (`src/index.ts`);
não existem na function serverless. `MetricsSnapshot` como tabela é hoje
alimentada só pelo seed.

### 4.7 Storage (`src/lib/supabase.ts`, `routes/uploads.ts`)

Cliente `@supabase/supabase-js` autenticado com a **service role key**
(`SUPABASE_SECRET_KEY`, nunca exposta ao front). Upload via `multer` em
memória (limite 15 MB), caminho `"{userId}/{uuid}.{ext}"` no bucket
`SUPABASE_STORAGE_BUCKET` (default `uploads`), retorna a URL pública. Usado
hoje para anexos de prontuário (`MedicalAttachment.fileUrl`).

## 5. Banco de dados (`backend/prisma/schema.prisma`)

PostgreSQL no Supabase, acessado via Prisma. Duas connection strings:

- **`DATABASE_URL`** — pooler *transaction mode* (porta 6543, `pgbouncer=true`),
  usada em runtime pelo `PrismaClient` (`src/db.ts`, instância única e
  reaproveitada entre requisições).
- **`DIRECT_URL`** — pooler *session mode* (porta 5432), usada só por
  `prisma db push` / ferramentas (Prisma Studio, DBeaver) que precisam de
  sessão persistente (prepared statements).

### Domínios principais do schema

- **Identidade**: `User`, `Role`/`UserRole`, `RefreshToken`, e os "perfis"
  `Patient`, `Professional`, `Employee` (1:1 opcionais com `User`).
- **Catálogo**: `Service`, `Category`, `Room`, `Equipment` e tabelas de
  associação N:N (`ProfessionalService`, `ServiceCategory`, `RoomService`,
  `RoomEquipment`, `ServiceEquipment`, `ProfessionalCategory`).
- **Agenda**: `Appointment` (chave única `[professionalId, date, time]` evita
  choque de horário), `ProfessionalSchedule`, `ProfessionalBlock`,
  `AppointmentStatusLog`, `AppointmentEquipment`.
- **Financeiro**: `Payment`, `Commission`, `Cost`, `ServiceTax`, `Plan`/`PlanService`.
- **Prontuário**: `MedicalRecord`, `SessionNote` (registro SOAP por
  atendimento), `MedicalAttachment`.
- **Comunicação**: `Conversation`/`Message`/`ConversationParticipant`,
  `MessageTemplate`/`NotificationRule`, `MessagingChannel`.
- **White label / institucional**: `AppSetting` (chave-valor genérica, é a
  fonte de `GET /api/configuracoes`), `Banner`, `HistoricMilestone`,
  `MissionVisionValue`, `AboutGalleryItem`.
- **Recrutamento**: `JobOpening`, `JobApplication`, `TalentPoolEntry`.
- **Integrações**: `Clinic` (uma linha "singleton" com credenciais de Gmail,
  Pub/Sub, Mercado Pago, WhatsApp, SMTP, Resend, Instagram).
- **Métricas/auditoria**: `MetricsSnapshot`, `MovementLog`.

O diagrama ER completo (Mermaid) está em [`backend/README.md`](../backend/README.md#diagrama-er).

## 6. Fluxo ponta a ponta (exemplo: agendamento público)

1. Visitante acessa `/agendar` (frontend, rota pública).
2. Front chama `GET /api/catalogo/servicos` e `GET /api/catalogo/profissionais`
   para montar o formulário.
3. Ao escolher profissional/serviço/mês, chama `GET /api/agenda` para os slots
   livres (`agenda.ts` cruza `ProfessionalSchedule`, `ProfessionalBlock` e
   `Appointment` existentes).
4. Envia `POST /api/agenda/agendamentos` com os dados do paciente/dependente.
   O backend valida conflito de horário (`lib/conflict.ts`), cria/atualiza o
   `Patient` e o `Appointment` (status inicial `Pendente`/`Agendado`).
5. Recepção/profissional veem o novo agendamento em `/recepcao/agenda` ou
   `/profissional/agenda`, que consomem `GET /api/agendamentos` (autenticado).
6. Mudanças de status (`PATCH /:id/status`), check-in, pagamento e evolução
   clínica seguem o mesmo padrão: rota autenticada → Prisma → DTO → JSON.

## 7. Implantação (deploy)

> **Atenção**: o `README.md` raiz (antes desta atualização) descrevia o
> backend como "rodando localmente, não deployado". Isso está desatualizado —
> desde o commit `6fae6cb` ("Adapta backend e frontend para deploy serverless
> na Vercel") o backend roda como **função serverless na Vercel**, assim como
> o frontend.

### Frontend — Vercel

- Projeto Vercel apontando para o diretório `frontend/`.
- Build: `npm run build` (`tsc -b && vite build`), output estático servido
  pela Vercel.
- `frontend/vercel.json` reescreve todas as rotas para `/index.html` (SPA).
- Variável de ambiente: `VITE_API_URL` apontando para a URL pública do
  backend (ex.: `https://aio-63dv.vercel.app/api`) — precisa estar definida
  no painel da Vercel do projeto frontend, já que é lida em **build time**
  pelo Vite.
- Domínio em produção: **https://www.psicologiaeexistir.com.br/**.

### Backend — Vercel (serverless)

- Projeto Vercel separado apontando para o diretório `backend/`.
- `backend/vercel.json` reescreve todas as rotas para a function `api/index.ts`.
- `api/index.ts` exporta o `app` Express sem `listen()`; cada invocação é uma
  execução serverless isolada (cold start reconecta ao Postgres via o
  pooler `DATABASE_URL`, por isso o uso do pooler transaction-mode é
  importante aqui).
- Variáveis de ambiente obrigatórias no painel da Vercel do projeto backend:
  `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
  `SUPABASE_STORAGE_BUCKET`, `JWT_SIGNING_KEY` (+ opcionais `JWT_ISSUER`,
  `JWT_AUDIENCE`, `JWT_ACCESS_TOKEN_MINUTES`, `JWT_REFRESH_TOKEN_DAYS`,
  `PORT` — irrelevante em serverless) e `CORS_ORIGINS` contendo o domínio do
  frontend (`https://www.psicologiaeexistir.com.br`).
- `postinstall: prisma generate` garante que o Prisma Client é gerado no
  build da Vercel.
- Domínio em produção: **https://aio-63dv.vercel.app/**.

### Banco — Supabase

- Gerenciado direto pelo painel do Supabase (projeto `dxjzsszbzmwozgmpntsp`).
- Migrações de schema aplicadas via `npm run prisma:push` (usa `DIRECT_URL`,
  porta 5432) a partir de uma máquina com acesso às credenciais — não há
  pipeline de CI/CD para isso hoje.
- Bucket de Storage `uploads` para anexos de prontuário.

### Rodando localmente

Ver [`README.md`](../README.md) (frontend) e [`backend/README.md`](../backend/README.md)
(backend) para os passos completos (`npm install`, `.env`, `prisma:push`,
`seed`, `dev`).

## 8. Pontos de atenção

- **Credenciais de integrações em texto puro**: o modelo `Clinic` guarda
  tokens/segredos (Gmail, Mercado Pago, WhatsApp, SMTP, Resend, Instagram)
  sem criptografia em colunas do Postgres. Se essas integrações forem
  ativadas de fato, vale revisar como esse segredo é armazenado/mascarado.
- **Jobs são stubs**: não há disparo real de notificações nem geração
  periódica de `MetricsSnapshot` — e mesmo esses stubs só rodam no modo local
  (`src/index.ts`), não na function serverless da Vercel.
- **`frontend/src/mocks/`**: código morto do protótipo inicial, mantido só
  como referência histórica; pode ser removido com segurança quando não for
  mais necessário para consulta.
- **Dados em produção já não são "mock genérico"**: a instância publicada em
  produção (`https://aio-63dv.vercel.app/`) já tem `AppSetting` configurado
  com o nome/tema reais da clínica **Psicologia E Existir**, não com o
  placeholder "AIO" do seed original — confirmar com o time antes de rodar
  qualquer rotina de limpeza/reset do banco de produção.
- **Sem testes automatizados**: não há suíte de testes (unitários/e2e) no
  repositório atualmente.
