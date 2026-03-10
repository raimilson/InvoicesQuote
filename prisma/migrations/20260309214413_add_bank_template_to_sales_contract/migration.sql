-- AlterTable
ALTER TABLE "SalesContract" ADD COLUMN     "bank_template_id" TEXT;

-- AddForeignKey
ALTER TABLE "SalesContract" ADD CONSTRAINT "SalesContract_bank_template_id_fkey" FOREIGN KEY ("bank_template_id") REFERENCES "BankTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
