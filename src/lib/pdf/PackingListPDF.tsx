import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

function fmtDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

const BLUE = "#2AABE2", GRAY = "#555555", BORDER = "#e0e0e0", LIGHT = "#f8f8f8";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#222", paddingTop: 40, paddingBottom: 52, paddingHorizontal: 45, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  logo: { width: 120, height: 40, objectFit: "contain", marginBottom: 6 },
  companyName: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  companyDetail: { fontSize: 8, color: GRAY, lineHeight: 1.5 },
  titleText: { fontSize: 22, fontFamily: "Helvetica-Bold", color: BLUE, letterSpacing: 1, textAlign: "right" },
  divider: { height: 1, backgroundColor: BORDER, marginBottom: 16 },
  partyTable: { flexDirection: "row", borderWidth: 0.5, borderColor: BORDER, marginBottom: 16 },
  partyCol: { flex: 1, padding: 10, borderRightWidth: 0.5, borderRightColor: BORDER },
  partyColLast: { flex: 1, padding: 10 },
  partyHeader: { fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 8, color: "#333" },
  partyLine: { fontSize: 8, marginBottom: 3 },
  partyLabel: { fontFamily: "Helvetica-Bold", color: GRAY },
  table: { marginBottom: 10 },
  tHead: { flexDirection: "row", backgroundColor: BLUE, paddingVertical: 6, paddingHorizontal: 6, borderRadius: 2 },
  tRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tTotalRow: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 6, borderTopWidth: 1, borderTopColor: "#bbb" },
  tRowAlt: { backgroundColor: LIGHT },
  th: { color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 7.5 },
  td: { fontSize: 8 },
  tTd: { fontSize: 8, fontFamily: "Helvetica-Bold" },
  cProduct: { flex: 1 }, cCartoon: { width: "10%", textAlign: "center" },
  cQtyCart: { width: "12%", textAlign: "center" }, cGW: { width: "10%", textAlign: "center" },
  cSize: { width: "14%", textAlign: "center" }, cCtns: { width: "8%", textAlign: "center" },
  cTotalPcs: { width: "12%", textAlign: "center" }, cTotalGW: { width: "12%", textAlign: "center" },
  sigRow: { flexDirection: "row", marginTop: 16, gap: 20 },
  sigBox: { flex: 1, borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 8 },
  sigLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  sigLine: { fontSize: 8, color: GRAY },
  footer: { position: "absolute", bottom: 22, left: 45, right: 45, textAlign: "center", fontSize: 9, color: BLUE, fontFamily: "Helvetica-Bold", borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 8 },
});

export interface PackingLineItem { product: string; carton_number: number; qty_per_carton: number; total_pcs: number; }
export interface CartonInfo { carton_number: number; gross_weight_kg?: number | null; size_cm?: string | null; ctns?: number | null; total_weight?: number | null; }
export interface CompanyInfo { name: string; address: string; ein?: string | null; }
export interface PackingListPDFProps {
  packing_number: string; date: string; logoSrc: string;
  company: CompanyInfo;
  client: { name: string; company?: string | null; address?: string | null; phone?: string | null; email?: string | null };
  lineItems: PackingLineItem[]; cartons: CartonInfo[]; notes?: string | null;
}

export default function PackingListPDF({ packing_number, date, logoSrc, company, client, lineItems, cartons, notes }: PackingListPDFProps) {
  const addressLines = company.address.split(",").map(l => l.trim()).filter(Boolean);
  const totalPcs = lineItems.reduce((s, i) => s + i.total_pcs, 0);
  const totalGW = cartons.reduce((s, c) => s + (c.gross_weight_kg ?? 0), 0);
  const totalCtns = cartons.reduce((s, c) => s + (c.ctns ?? 1), 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Image src={logoSrc} style={s.logo} />
            <Text style={s.companyName}>{company.name}</Text>
            {addressLines.map((l, i) => <Text key={i} style={s.companyDetail}>{l}</Text>)}
          </View>
          <View>
            <Text style={s.titleText}>PACKING LIST</Text>
            <Text style={[s.companyDetail, { textAlign: "right", marginTop: 4 }]}>PL # {packing_number}  |  {fmtDate(date)}</Text>
          </View>
        </View>
        <View style={s.divider} />

        {/* Buyer / Seller */}
        <View style={s.partyTable}>
          <View style={s.partyCol}>
            <Text style={s.partyHeader}>Buyer</Text>
            <Text style={s.partyLine}><Text style={s.partyLabel}>Ship to: </Text>{client.name}</Text>
            <Text style={s.partyLine}><Text style={s.partyLabel}>Company: </Text>{client.company ?? client.name}</Text>
            {client.address && <Text style={s.partyLine}><Text style={s.partyLabel}>Address: </Text>{client.address}</Text>}
            {client.phone && <Text style={s.partyLine}><Text style={s.partyLabel}>Phone: </Text>{client.phone}</Text>}
            {client.email && <Text style={s.partyLine}><Text style={s.partyLabel}>E-mail: </Text>{client.email}</Text>}
          </View>
          <View style={s.partyColLast}>
            <Text style={s.partyHeader}>Seller</Text>
            <Text style={s.partyLine}><Text style={s.partyLabel}>Company: </Text>{company.name}</Text>
            {addressLines.map((l, i) => <Text key={i} style={s.partyLine}>{l}</Text>)}
          </View>
        </View>

        {/* Items table */}
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.th, s.cProduct]}>Product</Text>
            <Text style={[s.th, s.cCartoon]}>Carton #</Text>
            <Text style={[s.th, s.cQtyCart]}>QTY/Carton</Text>
            <Text style={[s.th, s.cGW]}>G.W (KGS)</Text>
            <Text style={[s.th, s.cSize]}>Size (CM)</Text>
            <Text style={[s.th, s.cCtns]}>CTNS</Text>
            <Text style={[s.th, s.cTotalPcs]}>Total PCS</Text>
            <Text style={[s.th, s.cTotalGW]}>Total G.W</Text>
          </View>
          {lineItems.map((item, i) => {
            const carton = cartons.find(c => c.carton_number === item.carton_number);
            return (
              <View key={i} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
                <Text style={[s.td, s.cProduct]}>{item.product}</Text>
                <Text style={[s.td, s.cCartoon]}>{item.carton_number}</Text>
                <Text style={[s.td, s.cQtyCart]}>{item.qty_per_carton}</Text>
                <Text style={[s.td, s.cGW]}>{carton?.gross_weight_kg ?? ""}</Text>
                <Text style={[s.td, s.cSize]}>{carton?.size_cm ?? ""}</Text>
                <Text style={[s.td, s.cCtns]}>{carton?.ctns ?? ""}</Text>
                <Text style={[s.td, s.cTotalPcs]}>{item.total_pcs}</Text>
                <Text style={[s.td, s.cTotalGW]}>{carton?.total_weight ?? ""}</Text>
              </View>
            );
          })}
          <View style={s.tTotalRow}>
            <Text style={[s.tTd, s.cProduct]}>TOTAL</Text>
            <Text style={[s.tTd, s.cCartoon]}></Text>
            <Text style={[s.tTd, s.cQtyCart]}></Text>
            <Text style={[s.tTd, s.cGW]}></Text>
            <Text style={[s.tTd, s.cSize]}></Text>
            <Text style={[s.tTd, s.cCtns]}>{totalCtns}</Text>
            <Text style={[s.tTd, s.cTotalPcs]}>{totalPcs}</Text>
            <Text style={[s.tTd, s.cTotalGW]}>{totalGW > 0 ? totalGW : ""}</Text>
          </View>
        </View>

        {notes && <Text style={{ fontSize: 8, color: GRAY, marginBottom: 12 }}>{notes}</Text>}

        {/* Signatures */}
        <View style={s.sigRow}>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Buyer</Text>
            <Text style={s.sigLine}>Signature: _______________________</Text>
          </View>
          <View style={s.sigBox}>
            <Text style={s.sigLabel}>Seller</Text>
            <Text style={s.sigLine}>Signature: _______________________</Text>
          </View>
        </View>

        <Text style={s.footer}>Thank you for doing business with us!  —  {company.name}</Text>
      </Page>
    </Document>
  );
}
