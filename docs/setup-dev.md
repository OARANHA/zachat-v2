# Setup de Dev/Instalação Nova – 28web Hub Backend

Este documento descreve o fluxo recomendado para subir uma instalação **nova** do backend, com tenant padrão, settings, usuários, RBAC e billing configurados de forma idempotente.[web:64][web:65]

---

## 1. Subir infraestrutura básica

Na raiz do projeto:

docker-compose up -d postgres redis backend



- O backend é montado em `/usr/src/app` dentro do container via volume `./backend:/usr/src/app`.[web:96]

---

## 2. Rodar migrations

docker-compose exec backend npx sequelize-cli db:migrate



Garantias importantes nesta versão:

- Migration antiga `20200904070001-create-default-tenant` foi removida/arquivada (quebrava com colunas antigas de `Tenants`).[web:64]
- Migration `20250101000000-add-unique-rbac-constraints` cria:
  - `UNIQUE ("name","tenantId")` em `"Roles"`;
  - `UNIQUE ("name","tenantId")` em `"Permissions"`;
  - `UNIQUE ("roleId","permissionId")` em `"RolePermissions"`.  
  Essas constraints dão suporte aos `ON CONFLICT` usados nos seeds de RBAC.[web:161]

---

## 3. Tenant padrão

O sistema assume um tenant principal (`id = 1`) para settings, usuários default, RBAC e billing.

Verificar:

docker-compose exec postgres psql -U chatex -d chatex -c 'SELECT id, name FROM "Tenants";'



Se não existir nenhum registro, criar o tenant padrão:

docker-compose exec postgres psql -U chatex -d chatex -c "
INSERT INTO "Tenants" (
id, status, "ownerId", "createdAt", "updatedAt",
"businessHours", "messageBusinessHours",
"maxUsers", "maxConnections", name
) VALUES (
1,
'active',
NULL,
NOW(),
NOW(),
'[]',
'Olá! Fantástico receber seu contato! No momento estamos ausentes e não poderemos lhe atender, mas vamos priorizar seu atendimento e retornaremos logo mais. Agradecemos muito o contato.',
10,
5,
'Empresa Padrão'
)
ON CONFLICT (id) DO NOTHING;
"



Esse tenant será usado como base para seeds de settings, usuários, permissões e billing.[web:148]

---

## 4. Seeds essenciais

### 4.1. Settings e usuários padrão

Rodar em ordem:

docker-compose exec backend npx sequelize-cli db:seed --seed 20200904070004-create-default-settings.js
docker-compose exec backend npx sequelize-cli db:seed --seed 20200904070005-create-default-users.js



- Esses seeds:
  - Criam configurações padrão vinculadas ao `tenantId = 1`;
  - Criam usuários iniciais (ex.: admin/suporte) também associados ao tenant padrão.[web:65]

### 4.2. RBAC (permissões, papéis, vínculos)

Seed: `20250101000001-create-rbac-defaults.ts` (ajustado para ser idempotente):

- Descobre o tenant dinamicamente:

const rows = await queryInterface.sequelize.query<TenantRow>(
SELECT id FROM "Tenants" WHERE name = 'Tenant Padrão' OR name = 'Empresa Padrão' LIMIT 1,
{ type: QueryTypes.SELECT }
);
const tenantId = rows?.id ?? 1;



- **Permissions**
- Insere as permissões base (user:*, role:*, ticket:*, message:*, whatsapp:*, admin:all) com:

  ```
  ON CONFLICT ("name","tenantId") DO NOTHING
  ```

- Usa a constraint `UNIQUE ("name","tenantId")` de `"Permissions"`. [web:161]

- **Roles**
- Cria `Super Admin`, `Admin`, `Supervisor`, `Agente` com:

  ```
  ON CONFLICT ("name","tenantId") DO NOTHING
  ```

- Usa a constraint `UNIQUE ("name","tenantId")` de `"Roles"`. [web:161]

- **RolePermissions**
- Popula permissões para cada papel com:

  ```
  INSERT INTO "RolePermissions" ("roleId", "permissionId", "tenantId", "createdAt", "updatedAt")
  SELECT r.id, p.id, ${tenantId}, NOW(), NOW()
  FROM "Roles" r
  CROSS JOIN "Permissions" p
  WHERE ...
  ON CONFLICT ("roleId","permissionId") DO NOTHING
  ```

- Usa `UNIQUE ("roleId","permissionId")` de `"RolePermissions"`. [web:161]

Fluxo:

docker-compose exec backend npx sequelize-cli db:seed --seed 20250101000001-create-rbac-defaults.js
docker-compose exec backend npx sequelize-cli db:seed --seed 20250101000002-assign-user-roles.js



- O segundo seed associa usuários padrão aos roles (`UserRoles`).[web:65]

### 4.3. Billing (Plans, ERPProviders, TenantPlans, Subscriptions)

Seed: `20250120000001-create-billing-defaults.ts`.

**Plans**

- Verifica se já existem planos:

SELECT COUNT(*) FROM "Plans";



- Se zero, insere `Starter`, `Professional`, `Enterprise` com limites e features em JSON, billing mensal e `status = 'active'`.[web:114]

**ERPProviders**

- Busca até 4 tenants:

const tenants = await queryInterface.sequelize.query<IdRow>(
SELECT id FROM "Tenants" LIMIT 4,
{ type: QueryTypes.SELECT }
);



- Estrutura base:

const erpProvidersBase = [
{ tenantIdx: 0, providerType: "vendaerp", ... },
{ tenantIdx: 1, providerType: "bling", ... },
{ tenantIdx: 2, providerType: "omie", ... },
{ tenantIdx: 3, providerType: "mercadopago", ... }
];



- **Importante (ajuste dinâmico):**

const erpProviders = erpProvidersBase
.filter(p => tenants[p.tenantIdx]) // só cria se o tenant existir
.map(p => ({
tenantId: tenants[p.tenantIdx].id,
providerType: p.providerType,
apiKey: p.apiKey,
webhookSecret: p.webhookSecret,
webhookUrl: p.webhookUrl,
status: p.status,
createdAt: new Date(),
updatedAt: new Date()
}));



- Opcionalmente, usar `ON CONFLICT ("providerType","tenantId") DO NOTHING` se houver UNIQUE correspondente em `"ERPProviders"`. [web:161]

**TenantPlans**

- Lê planos e tenants, gera combinações (Starter/Professional/Enterprise) mapeadas por índice de tenant (`tenantIdx`), só insere se ambos existirem.
- Usa datas base fixas para `currentPeriodStart/End`.

**Subscriptions**

- Só insere se existirem tenants, planos e `ERPProviders` correspondentes.
- Monta subscriptions para cada tenant, ligando `Tenant → Plan → ERPProvider` com invoice e amount simulados.[web:114]

Fluxo de seed de billing:

docker-compose exec backend npx sequelize-cli db:seed --seed 20250120000001-create-billing-defaults.js



Graças aos `COUNT(*)` e filtros por tenant/plan/provider, o seed pode ser rodado múltiplas vezes sem violar FKs ou UNIQUE.[web:148][web:161]

---

## 5. Fluxo completo recomendado para instalação nova

1. Subir serviços:

docker-compose up -d postgres redis backend



2. Rodar migrations:

docker-compose exec backend npx sequelize-cli db:migrate



3. Garantir tenant padrão (id 1):

docker-compose exec postgres psql -U chatex -d chatex -c 'SELECT id, name FROM "Tenants";'

Se necessário, executar o INSERT de criação do tenant 1 (seção 3).


4. Rodar seeds essenciais em ordem:

docker-compose exec backend npx sequelize-cli db:seed --seed 20200904070004-create-default-settings.js
docker-compose exec backend npx sequelize-cli db:seed --seed 20200904070005-create-default-users.js
docker-compose exec backend npx sequelize-cli db:seed --seed 20250101000001-create-rbac-defaults.js
docker-compose exec backend npx sequelize-cli db:seed --seed 20250101000002-assign-user-roles.js
docker-compose exec backend npx sequelize-cli db:seed --seed 20250120000001-create-billing-defaults.js



5. (Opcional) A partir daí, `db:seed:all` torna‑se seguro, pois todos os seeds foram ajustados para serem idempotentes:

docker-compose exec backend npx sequelize-cli db:seed:all



---

## 6. Reset de ambiente de dev (quando necessário)

Para limpar apenas RBAC + Billing em dev:

docker-compose exec postgres psql -U chatex -d chatex -c '
TRUNCATE TABLE "RolePermissions" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "UserRoles" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Roles" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Permissions" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Subscriptions" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "TenantPlans" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "ERPProviders" RESTART IDENTITY CASCADE;
TRUNCATE TABLE "Plans" RESTART IDENTITY CASCADE;
'



Depois, rodar novamente os seeds de RBAC e Billing conforme seções 4.2 e 4.3.

---

## 7. Dashboard SuperAdmin - Tenants com Consumo

Este fluxo lista empresas com consumo agregado (usuários, conexões e mensagens do mês).

Passos rápidos:

1) Rodar migrations (garante colunas como Tenants.name e Messages.tenantId):

  - docker-compose exec backend npx sequelize-cli db:migrate

2) Reiniciar o backend:

  - docker-compose restart backend

3) Testar o endpoint como super admin:

  - curl -H "Authorization: Bearer <TOKEN_SUPER>" http://localhost/api/admin/dashboard/tenants

Resposta esperada (shape resumido):

[
 {
   "id": 1,
   "name": "Empresa Padrão",
   "status": "active",
   "owner": { "name": "N/A" | "Nome", "email": "N/A" | "email@dominio" },
   "consumption": {
     "users": { "current": 0, "max": 5, "percentage": 0 },
     "connections": { "current": 0, "max": 1, "percentage": 0 },
     "messages": { "current": 0, "max": 10000, "percentage": 0 }
   },
   "createdAt": "2025-12-22T10:00:00.000Z"
 }
]

Notas:
- O cálculo de percentuais protege contra divisão por zero.
- Contagem de mensagens considera apenas o mês corrente e filtra por tenantId.
- Em caso de 500, o backend loga a causa no AdminController (msg, err, stack); colete com `docker compose logs backend -n 200`.

---