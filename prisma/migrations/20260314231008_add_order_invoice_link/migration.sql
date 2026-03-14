-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "order_confirmation_id" TEXT;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_order_confirmation_id_fkey" FOREIGN KEY ("order_confirmation_id") REFERENCES "OrderConfirmation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
