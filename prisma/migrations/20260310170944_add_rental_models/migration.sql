-- CreateEnum
CREATE TYPE "RentalQuoteStatus" AS ENUM ('RASCUNHO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'CONVERTIDO');

-- CreateEnum
CREATE TYPE "RentalOrderStatus" AS ENUM ('CONFIRMADO', 'PAGO_PARCIAL', 'PAGO', 'ENTREGUE', 'CONCLUIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "RentalProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "image_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalClient" (
    "id" TEXT NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "cpf_cnpj" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "endereco" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalQuote" (
    "id" TEXT NOT NULL,
    "quote_number" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "data_evento" TIMESTAMP(3) NOT NULL,
    "endereco_entrega" TEXT NOT NULL,
    "horario_inicio" TEXT NOT NULL,
    "horario_fim" TEXT NOT NULL,
    "responsavel_nome" TEXT,
    "responsavel_telefone" TEXT,
    "uso_monitor" BOOLEAN NOT NULL DEFAULT false,
    "qtd_monitores" INTEGER NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "desconto" DECIMAL(12,2),
    "total" DECIMAL(12,2) NOT NULL,
    "horas_contratadas" INTEGER NOT NULL DEFAULT 4,
    "status" "RentalQuoteStatus" NOT NULL DEFAULT 'RASCUNHO',
    "notes" TEXT,
    "converted_to_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalQuoteItem" (
    "id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "preco_unit" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "RentalQuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentalOrder" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "from_quote_id" TEXT,
    "data_evento" TIMESTAMP(3) NOT NULL,
    "endereco_entrega" TEXT NOT NULL,
    "horario_inicio" TEXT NOT NULL,
    "horario_fim" TEXT NOT NULL,
    "responsavel_nome" TEXT,
    "responsavel_telefone" TEXT,
    "uso_monitor" BOOLEAN NOT NULL DEFAULT false,
    "qtd_monitores" INTEGER NOT NULL DEFAULT 0,
    "items" JSONB NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "desconto" DECIMAL(12,2),
    "total" DECIMAL(12,2) NOT NULL,
    "horas_contratadas" INTEGER NOT NULL DEFAULT 4,
    "pagamento_sinal" DECIMAL(12,2),
    "pagamento_metodo" TEXT,
    "status" "RentalOrderStatus" NOT NULL DEFAULT 'CONFIRMADO',
    "notes" TEXT,
    "contract_generated" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentalQuote_quote_number_key" ON "RentalQuote"("quote_number");

-- CreateIndex
CREATE UNIQUE INDEX "RentalQuote_converted_to_id_key" ON "RentalQuote"("converted_to_id");

-- CreateIndex
CREATE UNIQUE INDEX "RentalOrder_order_number_key" ON "RentalOrder"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "RentalOrder_from_quote_id_key" ON "RentalOrder"("from_quote_id");

-- AddForeignKey
ALTER TABLE "RentalQuote" ADD CONSTRAINT "RentalQuote_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "RentalClient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalQuoteItem" ADD CONSTRAINT "RentalQuoteItem_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "RentalQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalQuoteItem" ADD CONSTRAINT "RentalQuoteItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "RentalProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrder" ADD CONSTRAINT "RentalOrder_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "RentalClient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalOrder" ADD CONSTRAINT "RentalOrder_from_quote_id_fkey" FOREIGN KEY ("from_quote_id") REFERENCES "RentalQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
