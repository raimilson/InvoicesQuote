import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

function fmtDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

const BLUE = "#2AABE2";
const GRAY = "#555555";
const BORDER = "#e0e0e0";
const LIGHT = "#f8f8f8";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#222", paddingTop: 40, paddingBottom: 52, paddingHorizontal: 45, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 },
  companyBlock: { flex: 1 },
  logo: { width: 120, height: 40, objectFit: "contain", marginBottom: 6 },
  companyName: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  companyDetail: { fontSize: 8, color: GRAY, lineHeight: 1.5 },
  titleBlock: { alignItems: "flex-end" },
  titleText: { fontSize: 34, fontFamily: "Helvetica-Bold", color: "#1a1a1a", letterSpacing: 3 },
  docNumber: { fontSize: 11, color: BLUE, fontFamily: "Helvetica-Bold", marginTop: 6 },
  divider: { height: 1, backgroundColor: BORDER, marginBottom: 20 },
  billingRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  billToBlock: { flex: 1 },
  billToLabel: { fontSize: 8, color: GRAY, marginBottom: 5 },
  billToCompany: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  billToLine: { fontSize: 8, color: GRAY, lineHeight: 1.55 },
  metaBlock: { alignItems: "flex-end" },
  metaRow: { flexDirection: "row", gap: 10, marginBottom: 3 },
  metaLabel: { fontSize: 8, color: GRAY, width: 60, textAlign: "right" },
  metaValue: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 72, textAlign: "right" },
  table: { marginBottom: 6 },
  tHead: { flexDirection: "row", backgroundColor: BLUE, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 2 },
  tRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tRowAlt: { backgroundColor: LIGHT },
  th: { color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 8 },
  td: { fontSize: 8.5 },
  cNum: { width: "5%" },
  cDesc: { flex: 1 },
  cQty: { width: "10%", textAlign: "right" },
  cRate: { width: "16%", textAlign: "right" },
  cAmt: { width: "17%", textAlign: "right" },
  totalsSection: { alignItems: "flex-end", marginTop: 6, marginBottom: 22 },
  totRow: { flexDirection: "row", paddingVertical: 3, borderTopWidth: 0.5, borderTopColor: BORDER, width: 230 },
  totLabel: { flex: 1, fontSize: 8.5, color: GRAY, textAlign: "right", paddingRight: 12 },
  totValue: { width: 80, fontSize: 8.5, textAlign: "right" },
  grandRow: { flexDirection: "row", paddingVertical: 5, borderTopWidth: 1.5, borderTopColor: "#bbb", marginTop: 3, width: 230 },
  grandLabel: { flex: 1, fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "right", paddingRight: 12 },
  grandValue: { width: 80, fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "right" },
  section: { marginBottom: 16 },
  sTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#333", marginBottom: 5, paddingBottom: 3, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  sText: { fontSize: 8.5, color: GRAY, lineHeight: 1.6 },
  termLine: { fontSize: 8.5, color: GRAY, lineHeight: 1.7 },
  bankBox: { marginBottom: 16, padding: 10, borderWidth: 0.5, borderColor: BORDER, borderRadius: 3 },
  bankTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: BLUE, marginBottom: 6 },
  bankGrid: { flexDirection: "row", flexWrap: "wrap" },
  bankItem: { width: "50%", flexDirection: "row", marginBottom: 3 },
  bankKey: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: GRAY, width: 68 },
  bankVal: { fontSize: 7.5, flex: 1 },
  footer: { position: "absolute", bottom: 22, left: 45, right: 45, textAlign: "center", fontSize: 9, color: BLUE, fontFamily: "Helvetica-Bold", borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 8 },
});

export interface LineItem {
  item_number: number;
  description: string;
  product_service?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BankTemplate {
  name: string;
  currency: string;
  account_number: string;
  institution_no?: string | null;
  transit_no?: string | null;
  swift_bic?: string | null;
  bank_name: string;
  bank_address: string;
}

export interface PDFProps {
  type: "INVOICE" | "QUOTE";
  number: string;
  date: string;
  dueDate?: string;
  validUntil?: string;
  client: { name: string; company?: string | null; address?: string | null; phone?: string | null; email?: string | null };
  lineItems: LineItem[];
  subtotal: number;
  tax?: number | null;
  total: number;
  notes?: string | null;
  paymentTerms?: string | null;
  bankTemplate: BankTemplate;
}

export default function InvoicePDF({ type, number, date, dueDate, validUntil, client, lineItems, subtotal, tax, total, notes, paymentTerms, bankTemplate }: PDFProps) {
  const termLines = (paymentTerms ?? "").split(/\n|;/).map((t) => t.trim()).filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.companyBlock}>
            <Image src="/logo.png" style={s.logo} />
            <Text style={s.companyName}>Kezpo Solutions Inc</Text>
            <Text style={s.companyDetail}>66 Kowalsky Cres, Winnipeg MB R3R3A8</Text>
            <Text style={s.companyDetail}>raimilson@kezpo.ca  |  www.kezpo.ca</Text>
          </View>
          <View style={s.titleBlock}>
            <Text style={s.titleText}>{type}</Text>
            <Text style={s.docNumber}># {number}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Bill To + Meta */}
        <View style={s.billingRow}>
          <View style={s.billToBlock}>
            <Text style={s.billToLabel}>Bill To</Text>
            <Text style={s.billToCompany}>{client.company ?? client.name}</Text>
            {client.company && <Text style={s.billToLine}>{client.name}</Text>}
            {(client.address ?? "").split(",").map((line, i) => (
              <Text key={i} style={s.billToLine}>{line.trim()}</Text>
            ))}
            {client.phone && <Text style={s.billToLine}>{client.phone}</Text>}
            {client.email && <Text style={s.billToLine}>{client.email}</Text>}
          </View>
          <View style={s.metaBlock}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Date:</Text>
              <Text style={s.metaValue}>{fmtDate(date)}</Text>
            </View>
            {dueDate && (
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>Due Date:</Text>
                <Text style={s.metaValue}>{fmtDate(dueDate)}</Text>
              </View>
            )}
            {validUntil && (
              <View style={s.metaRow}>
                <Text style={s.metaLabel}>Valid Until:</Text>
                <Text style={s.metaValue}>{fmtDate(validUntil)}</Text>
              </View>
            )}
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>Currency:</Text>
              <Text style={s.metaValue}>{bankTemplate.currency}</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.th, s.cNum]}>#</Text>
            <Text style={[s.th, s.cDesc]}>Item &amp; Description</Text>
            <Text style={[s.th, s.cQty]}>Qty</Text>
            <Text style={[s.th, s.cRate]}>Rate</Text>
            <Text style={[s.th, s.cAmt]}>Amount</Text>
          </View>
          {lineItems.map((item, i) => {
            const text = item.description || item.product_service || "";
            return (
              <View key={i} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
                <Text style={[s.td, s.cNum]}>{item.item_number}</Text>
                <Text style={[s.td, s.cDesc]}>{text}</Text>
                <Text style={[s.td, s.cQty]}>{item.quantity}</Text>
                <Text style={[s.td, s.cRate]}>{fmtCurrency(item.rate)}</Text>
                <Text style={[s.td, s.cAmt]}>{fmtCurrency(item.amount)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={s.totalsSection}>
          <View style={s.totRow}>
            <Text style={s.totLabel}>Sub Total</Text>
            <Text style={s.totValue}>{fmtCurrency(subtotal)}</Text>
          </View>
          {tax != null && tax > 0 && (
            <View style={s.totRow}>
              <Text style={s.totLabel}>Tax</Text>
              <Text style={s.totValue}>{fmtCurrency(tax)}</Text>
            </View>
          )}
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>Total</Text>
            <Text style={s.grandValue}>${fmtCurrency(total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {notes && (
          <View style={s.section}>
            <Text style={s.sTitle}>Notes</Text>
            <Text style={s.sText}>{notes}</Text>
          </View>
        )}

        {/* Terms & Conditions */}
        {termLines.length > 0 && (
          <View style={s.section}>
            <Text style={s.sTitle}>Terms &amp; Conditions</Text>
            {termLines.map((line, i) => (
              <Text key={i} style={s.termLine}>- {line}</Text>
            ))}
          </View>
        )}

        {/* Bank Info */}
        <View style={s.bankBox}>
          <Text style={s.bankTitle}>Bank Information — {bankTemplate.name}</Text>
          <View style={s.bankGrid}>
            <View style={s.bankItem}><Text style={s.bankKey}>Bank:</Text><Text style={s.bankVal}>{bankTemplate.bank_name}</Text></View>
            <View style={s.bankItem}><Text style={s.bankKey}>Account:</Text><Text style={s.bankVal}>{bankTemplate.account_number}</Text></View>
            {bankTemplate.institution_no && <View style={s.bankItem}><Text style={s.bankKey}>Institution:</Text><Text style={s.bankVal}>{bankTemplate.institution_no}</Text></View>}
            {bankTemplate.transit_no && <View style={s.bankItem}><Text style={s.bankKey}>Transit:</Text><Text style={s.bankVal}>{bankTemplate.transit_no}</Text></View>}
            {bankTemplate.swift_bic && <View style={s.bankItem}><Text style={s.bankKey}>SWIFT/BIC:</Text><Text style={s.bankVal}>{bankTemplate.swift_bic}</Text></View>}
            <View style={[s.bankItem, { width: "100%" }]}><Text style={s.bankKey}>Address:</Text><Text style={s.bankVal}>{bankTemplate.bank_address}</Text></View>
          </View>
        </View>

        {/* Footer */}
        <Text style={s.footer}>Thank you for doing business with us!  —  Kezpo Team</Text>

      </Page>
    </Document>
  );
}
