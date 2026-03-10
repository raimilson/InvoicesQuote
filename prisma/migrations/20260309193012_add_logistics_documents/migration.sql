-- CreateTable
CREATE TABLE "OrderConfirmation" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "invoice_id" TEXT,
    "client_id" TEXT NOT NULL,
    "company_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "delivery_date" TIMESTAMP(3),
    "payment_terms" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "purchase_order" TEXT,
    "line_items" JSONB NOT NULL,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryNotice" (
    "id" TEXT NOT NULL,
    "delivery_number" TEXT NOT NULL,
    "invoice_id" TEXT,
    "client_id" TEXT NOT NULL,
    "company_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "purchase_order" TEXT,
    "purchase_date" TIMESTAMP(3),
    "commercial_invoice" TEXT,
    "shipment_type" TEXT,
    "tracking_number" TEXT,
    "incoterms" TEXT,
    "country_of_origin" TEXT,
    "line_items" JSONB NOT NULL,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryNotice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingList" (
    "id" TEXT NOT NULL,
    "packing_number" TEXT NOT NULL,
    "invoice_id" TEXT,
    "delivery_id" TEXT,
    "client_id" TEXT NOT NULL,
    "company_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "line_items" JSONB NOT NULL,
    "cartons" JSONB NOT NULL,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesContract" (
    "id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "invoice_id" TEXT,
    "client_id" TEXT NOT NULL,
    "company_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "line_items" JSONB NOT NULL,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "client_vat_id" TEXT,
    "client_bank_name" TEXT,
    "client_bank_address" TEXT,
    "client_account" TEXT,
    "client_swift" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderConfirmation_order_number_key" ON "OrderConfirmation"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryNotice_delivery_number_key" ON "DeliveryNotice"("delivery_number");

-- CreateIndex
CREATE UNIQUE INDEX "PackingList_packing_number_key" ON "PackingList"("packing_number");

-- CreateIndex
CREATE UNIQUE INDEX "SalesContract_contract_number_key" ON "SalesContract"("contract_number");

-- AddForeignKey
ALTER TABLE "OrderConfirmation" ADD CONSTRAINT "OrderConfirmation_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderConfirmation" ADD CONSTRAINT "OrderConfirmation_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderConfirmation" ADD CONSTRAINT "OrderConfirmation_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNotice" ADD CONSTRAINT "DeliveryNotice_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNotice" ADD CONSTRAINT "DeliveryNotice_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryNotice" ADD CONSTRAINT "DeliveryNotice_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingList" ADD CONSTRAINT "PackingList_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingList" ADD CONSTRAINT "PackingList_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "DeliveryNotice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingList" ADD CONSTRAINT "PackingList_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackingList" ADD CONSTRAINT "PackingList_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesContract" ADD CONSTRAINT "SalesContract_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesContract" ADD CONSTRAINT "SalesContract_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesContract" ADD CONSTRAINT "SalesContract_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
