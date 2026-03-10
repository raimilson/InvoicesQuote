import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

function fmtDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

const CURRENCY_SYM: Record<string, string> = { USD: "$", CAD: "CA$", EUR: "€", BRL: "R$" };
function fmtMoney(n: number, sym: string) { return sym + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n); }

const BLUE = "#2AABE2", GRAY = "#555555", BORDER = "#e0e0e0", LIGHT = "#f8f8f8";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#222", paddingTop: 40, paddingBottom: 52, paddingHorizontal: 45, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 },
  companyBlock: { flex: 1 },
  logo: { width: 120, height: 40, objectFit: "contain", marginBottom: 6 },
  companyName: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  companyDetail: { fontSize: 8, color: GRAY, lineHeight: 1.5 },
  titleBlock: { alignItems: "flex-end" },
  titleText: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#1a1a1a", letterSpacing: 2 },
  docNumber: { fontSize: 11, color: BLUE, fontFamily: "Helvetica-Bold", marginTop: 6 },
  divider: { height: 1, backgroundColor: BORDER, marginBottom: 20 },
  billingRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  billToBlock: { flex: 1 },
  billToLabel: { fontSize: 8, color: GRAY, marginBottom: 5 },
  billToCompany: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  billToLine: { fontSize: 8, color: GRAY, lineHeight: 1.55 },
  metaBlock: { alignItems: "flex-end" },
  metaRow: { flexDirection: "row", gap: 10, marginBottom: 3 },
  metaLabel: { fontSize: 8, color: GRAY, width: 72, textAlign: "right" },
  metaValue: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 80, textAlign: "right" },
  table: { marginBottom: 6 },
  tHead: { flexDirection: "row", backgroundColor: BLUE, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 2 },
  tRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tRowAlt: { backgroundColor: LIGHT },
  th: { color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 8 },
  td: { fontSize: 8.5 },
  cNum: { width: "5%" }, cDesc: { flex: 1 }, cQty: { width: "10%", textAlign: "right" },
  cRate: { width: "16%", textAlign: "right" }, cAmt: { width: "17%", textAlign: "right" },
  totalsSection: { alignItems: "flex-end", marginTop: 6, marginBottom: 20 },
  totRow: { flexDirection: "row", paddingVertical: 3, borderTopWidth: 0.5, borderTopColor: BORDER, width: 230 },
  totLabel: { flex: 1, fontSize: 8.5, color: GRAY, textAlign: "right", paddingRight: 12 },
  totValue: { width: 80, fontSize: 8.5, textAlign: "right" },
  grandRow: { flexDirection: "row", paddingVertical: 5, borderTopWidth: 1.5, borderTopColor: "#bbb", marginTop: 3, width: 230 },
  grandLabel: { flex: 1, fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "right", paddingRight: 12 },
  grandValue: { width: 80, fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "right" },
  infoBox: { marginBottom: 14, padding: 10, borderWidth: 0.5, borderColor: BORDER, borderRadius: 3 },
  infoRow: { flexDirection: "row", marginBottom: 3 },
  infoKey: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY, width: 90 },
  infoVal: { fontSize: 8, flex: 1 },
  footer: { position: "absolute", bottom: 22, left: 45, right: 45, textAlign: "center", fontSize: 9, color: BLUE, fontFamily: "Helvetica-Bold", borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 8 },
});

export interface OrderLineItem { item_number: number; description: string; product_service?: string; quantity: number; rate: number; amount: number; }
export interface CompanyInfo { name: string; address: string; ein?: string | null; }
export interface OrderPDFProps {
  order_number: string; date: string; delivery_date?: string | null; purchase_order?: string | null;
  currency: string; company: CompanyInfo; logoSrc: string; payment_terms?: string | null;
  client: { name: string; company?: string | null; address?: string | null; phone?: string | null; email?: string | null };
  lineItems: OrderLineItem[]; subtotal: number; tax?: number | null; total: number; notes?: string | null;
}

export default function OrderConfirmationPDF({ order_number, date, delivery_date, purchase_order, currency, company, logoSrc, payment_terms, client, lineItems, subtotal, tax, total, notes }: OrderPDFProps) {
  const sym = CURRENCY_SYM[currency] ?? "$";
  const addressLines = company.address.split(",").map(l => l.trim()).filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.companyBlock}>
            <Image src={logoSrc} style={s.logo} />
            <Text style={s.companyName}>{company.name}</Text>
            {addressLines.map((l, i) => <Text key={i} style={s.companyDetail}>{l}</Text>)}
            {company.ein && <Text style={s.companyDetail}>EIN: {company.ein}</Text>}
          </View>
          <View style={s.titleBlock}>
            <Text style={s.titleText}>ORDER CONFIRMATION</Text>
            <Text style={s.docNumber}># {order_number}</Text>
          </View>
        </View>
        <View style={s.divider} />
        <View style={s.billingRow}>
          <View style={s.billToBlock}>
            <Text style={s.billToLabel}>Bill To</Text>
            <Text style={s.billToCompany}>{client.company ?? client.name}</Text>
            {client.company && <Text style={s.billToLine}>{client.name}</Text>}
            {(client.address ?? "").split(",").map((l, i) => <Text key={i} style={s.billToLine}>{l.trim()}</Text>)}
            {client.phone && <Text style={s.billToLine}>{client.phone}</Text>}
            {client.email && <Text style={s.billToLine}>{client.email}</Text>}
          </View>
          <View style={s.metaBlock}>
            <View style={s.metaRow}><Text style={s.metaLabel}>Date:</Text><Text style={s.metaValue}>{fmtDate(date)}</Text></View>
            {delivery_date && <View style={s.metaRow}><Text style={s.metaLabel}>Delivery Date:</Text><Text style={s.metaValue}>{fmtDate(delivery_date)}</Text></View>}
            {purchase_order && <View style={s.metaRow}><Text style={s.metaLabel}>PO:</Text><Text style={s.metaValue}>{purchase_order}</Text></View>}
            <View style={s.metaRow}><Text style={s.metaLabel}>Currency:</Text><Text style={s.metaValue}>{currency}</Text></View>
          </View>
        </View>
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.th, s.cNum]}>#</Text>
            <Text style={[s.th, s.cDesc]}>Item &amp; Description</Text>
            <Text style={[s.th, s.cQty]}>Qty</Text>
            <Text style={[s.th, s.cRate]}>Rate</Text>
            <Text style={[s.th, s.cAmt]}>Amount</Text>
          </View>
          {lineItems.map((item, i) => (
            <View key={i} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
              <Text style={[s.td, s.cNum]}>{item.item_number}</Text>
              <Text style={[s.td, s.cDesc]}>{item.description || item.product_service || ""}</Text>
              <Text style={[s.td, s.cQty]}>{item.quantity}</Text>
              <Text style={[s.td, s.cRate]}>{fmtMoney(item.rate, sym)}</Text>
              <Text style={[s.td, s.cAmt]}>{fmtMoney(item.amount, sym)}</Text>
            </View>
          ))}
        </View>
        <View style={s.totalsSection}>
          <View style={s.totRow}><Text style={s.totLabel}>Sub Total</Text><Text style={s.totValue}>{fmtMoney(subtotal, sym)}</Text></View>
          {tax != null && tax > 0 && <View style={s.totRow}><Text style={s.totLabel}>Tax</Text><Text style={s.totValue}>{fmtMoney(tax, sym)}</Text></View>}
          <View style={s.grandRow}><Text style={s.grandLabel}>Total</Text><Text style={s.grandValue}>{fmtMoney(total, sym)}</Text></View>
        </View>
        {(delivery_date || payment_terms || notes) && (
          <View style={s.infoBox}>
            {delivery_date && <View style={s.infoRow}><Text style={s.infoKey}>Delivery Date:</Text><Text style={s.infoVal}>{fmtDate(delivery_date)}</Text></View>}
            {payment_terms && <View style={s.infoRow}><Text style={s.infoKey}>Payment Terms:</Text><Text style={s.infoVal}>{payment_terms}</Text></View>}
            {notes && <View style={s.infoRow}><Text style={s.infoKey}>Notes:</Text><Text style={s.infoVal}>{notes}</Text></View>}
          </View>
        )}
        <Text style={s.footer}>Thank you for doing business with us!  —  {company.name}</Text>
      </Page>
    </Document>
  );
}
