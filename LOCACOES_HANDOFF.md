# Kezpo Locações — Handoff para Claude Code CLI

## O que é
Sistema de locação de brinquedos infláveis integrado ao sistema de invoices existente (`invoices-quote.vercel.app`). Workflow: **Orçamento → Pedido → Contrato de Locação (PDF)**.

## Estado Atual: TUDO CRIADO, FALTA TESTAR E FAZER DEPLOY

### ✅ Compilação
`npx tsc --noEmit` retorna **ZERO erros**. Tudo compila.

### ✅ Migration do banco
Migration `20260310170944_add_rental_models` criada e aplicada localmente. Falta rodar no Vercel (build script já tem `prisma migrate deploy`).

### ✅ Arquivos ainda NÃO commitados
Tudo está unstaged. Nada foi commitado nem deployado ainda.

```
Modified:
  prisma/schema.prisma
  src/app/(dashboard)/page.tsx          ← App selector (Solutions vs Locações)
  src/components/Sidebar.tsx            ← Sidebar route-aware
  src/components/StatusBadge.tsx        ← Statuses rental PT

New (untracked):
  prisma/migrations/20260310170944_add_rental_models/
  src/app/(dashboard)/locacoes/         ← 17 page files
  src/app/api/locacoes/                 ← 11 API route files
  src/components/locacoes/              ← 4 form components
  src/lib/numberToWordsPT.ts            ← Valor por extenso PT
  src/lib/pdf/RentalContractPDF.tsx     ← Contrato PDF (9 cláusulas)
  src/lib/pdf/RentalQuotePDF.tsx        ← Orçamento PDF
```

---

## Arquitetura

### Database (5 novos models no Prisma)
- **RentalProduct** — name, description, price, image_url, active
- **RentalClient** — nome_completo, cpf_cnpj, email, telefone, endereco
- **RentalQuote** — quote_number (ORC-N), client_id, data_evento, endereco_entrega, horario_inicio/fim, responsavel, uso_monitor, items via RentalQuoteItem, subtotal/desconto/total, horas_contratadas, status, notes
- **RentalQuoteItem** — quote_id, product_id, quantidade, preco_unit, total
- **RentalOrder** — order_number (PED-N), from_quote_id, client_id, items (JSON snapshot), subtotal/desconto/total, pagamento_sinal, pagamento_metodo, contract_generated, status, notes

### Enums
- **RentalQuoteStatus**: RASCUNHO, ENVIADO, APROVADO, REJEITADO, CONVERTIDO
- **RentalOrderStatus**: CONFIRMADO, PAGO_PARCIAL, PAGO, ENTREGUE, CONCLUIDO, CANCELADO

### API Routes (src/app/api/locacoes/)
| Rota | Métodos | Função |
|------|---------|--------|
| `produtos/` | GET, POST | Lista/cria produtos |
| `produtos/[id]/` | GET, PUT, DELETE | CRUD produto |
| `clientes/` | GET, POST | Lista/cria clientes |
| `clientes/[id]/` | GET, PUT, DELETE | CRUD cliente |
| `orcamentos/` | GET, POST | Lista/cria orçamentos (com items em transação) |
| `orcamentos/[id]/` | GET, PUT, DELETE | CRUD orçamento |
| `orcamentos/[id]/convert/` | POST | Converte APROVADO → Pedido |
| `pedidos/` | GET, POST | Lista/cria pedidos |
| `pedidos/[id]/` | GET, PUT, DELETE | CRUD pedido |
| `pedidos/[id]/contrato/` | GET | Gera PDF do contrato de locação |
| `upload/` | POST | Upload de imagem de produto |

### Pages (src/app/(dashboard)/locacoes/)
| Path | Arquivo | Função |
|------|---------|--------|
| `/locacoes` | `page.tsx` | Dashboard com stats e próximos eventos |
| `/locacoes/produtos` | `produtos/page.tsx` | Grid de produtos com cards |
| `/locacoes/produtos/new` | `produtos/new/page.tsx` | Novo produto |
| `/locacoes/produtos/[id]` | `produtos/[id]/page.tsx` | Detalhe produto |
| `/locacoes/produtos/[id]/edit` | `produtos/[id]/edit/page.tsx` | Editar produto |
| `/locacoes/clientes` | `clientes/page.tsx` | Lista de clientes (tabela) |
| `/locacoes/clientes/new` | `clientes/new/page.tsx` | Novo cliente |
| `/locacoes/clientes/[id]` | `clientes/[id]/page.tsx` | Detalhe cliente |
| `/locacoes/clientes/[id]/edit` | `clientes/[id]/edit/page.tsx` | Editar cliente |
| `/locacoes/orcamentos` | `orcamentos/page.tsx` | Lista orçamentos |
| `/locacoes/orcamentos/new` | `orcamentos/new/page.tsx` | Novo orçamento |
| `/locacoes/orcamentos/[id]` | `orcamentos/[id]/page.tsx` | Detalhe + ações (enviar, aprovar, converter) |
| `/locacoes/orcamentos/[id]/edit` | `orcamentos/[id]/edit/page.tsx` | Editar orçamento |
| `/locacoes/pedidos` | `pedidos/page.tsx` | Lista pedidos |
| `/locacoes/pedidos/new` | `pedidos/new/page.tsx` | Novo pedido (raro, geralmente vem de conversão) |
| `/locacoes/pedidos/[id]` | `pedidos/[id]/page.tsx` | Detalhe + gerar contrato PDF |
| `/locacoes/pedidos/[id]/edit` | `pedidos/[id]/edit/page.tsx` | Editar pedido |

### Components (src/components/locacoes/)
- **ProductForm.tsx** — Form de produto (name, description, price, image upload, active)
- **RentalClientForm.tsx** — Form de cliente (nome_completo, cpf_cnpj, email, telefone, endereco)
- **RentalQuoteForm.tsx** — Form de orçamento (client selector, event details, product items, totals)
- **RentalOrderForm.tsx** — Form de pedido (similar ao quote + pagamento)

### PDFs (src/lib/pdf/)
- **RentalContractPDF.tsx** — Contrato completo com 9 cláusulas, dados da KEZPO LOCAÇÕES (CNPJ 51805917/0001-02), assinaturas
- **RentalQuotePDF.tsx** — Orçamento com tabela de itens, brand color #2AABE2

### Sidebar (src/components/Sidebar.tsx)
- Detecta se pathname começa com `/locacoes` → mostra menu Locações
- Senão → mostra menu Solutions (invoices/quotes/logistics)
- Locações menu: Painel, Orçamentos, Pedidos, Produtos, Clientes, link "Voltar para Solutions"

### App Selector (src/app/(dashboard)/page.tsx)
- Duas cards: "Kezpo Solutions" → `/invoices`, "Kezpo Locações" → `/locacoes`

---

## Próximos Passos (o que fazer no CLI)

### 1. Testar localmente
```bash
npm run dev
# Abrir http://localhost:3000
# Testar: app selector → locações → criar produto → criar cliente → novo orçamento → aprovar → converter em pedido → gerar contrato PDF
```

### 2. Se houver bugs, corrigir

### 3. Commit
```bash
git add prisma/schema.prisma prisma/migrations/20260310170944_add_rental_models/ \
  src/app/\(dashboard\)/page.tsx src/app/\(dashboard\)/locacoes/ \
  src/app/api/locacoes/ src/components/Sidebar.tsx src/components/StatusBadge.tsx \
  src/components/locacoes/ src/lib/numberToWordsPT.ts \
  src/lib/pdf/RentalContractPDF.tsx src/lib/pdf/RentalQuotePDF.tsx

git commit -m "Add Kezpo Locações rental system with quotes, orders and contract PDF"
```

### 4. Deploy
```bash
git push origin master
# Vercel auto-deploys. Migration runs via build script: prisma migrate deploy
```

---

## Dados da Empresa (hardcoded no contrato PDF)
- **KEZPO LOCAÇÕES**
- CNPJ: 51805917/0001-02
- Endereço: Rua Safiras, 529, Jardim Boa Vista, Campo Magro-PR
- Foro: Comarca de Curitiba-PR

## Contrato de Locação — Regras de Negócio
- Pagamento: 50% no ato da reserva, saldo no dia do evento
- Hora excedente: R$ 120,00/hora
- Cancelamento >15 dias: sem penalidade
- Cancelamento 14-7 dias: retenção de 30% do valor
- Cancelamento <7 dias: perda do depósito
- Cancelamento por clima: sem penalidade

## Observações Importantes
- **Produtos usam campos em inglês** no Prisma/API: `name`, `description`, `price`, `image_url`, `active`
- **Clientes usam campos em português** no Prisma/API: `nome_completo`, `cpf_cnpj`, etc.
- Auto-incremento numérico: usa pattern `Math.max()` (não orderBy desc) para evitar bug lexicográfico
- Soft deletes: todos os models usam `deleted_at DateTime?`, sempre filtrar `where: { deleted_at: null }`
- Número dos documentos: ORC-N (orçamentos), PED-N (pedidos)
