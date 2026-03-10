import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

function fmtDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

const BLUE = "#2AABE2", GRAY = "#555555", BORDER = "#e0e0e0", LIGHT = "#f8f8f8";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#222", paddingTop: 40, paddingBottom: 52, paddingHorizontal: 45, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  companyBlock: { flex: 1 },
  logo: { width: 120, height: 40, objectFit: "contain", marginBottom: 6 },
  companyName: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  companyDetail: { fontSize: 8, color: GRAY, lineHeight: 1.5 },
  titleBlock: { alignItems: "flex-end" },
  titleText: { fontSize: 22, fontFamily: "Helvetica-Bold", color: BLUE, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: BORDER, marginBottom: 16 },
  billingRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  contactBlock: { flex: 1 },
  contactLine: { fontSize: 8.5, marginBottom: 3 },
  contactLabel: { fontFamily: "Helvetica-Bold", color: GRAY },
  metaBlock: { alignItems: "flex-end" },
  metaRow: { flexDirection: "row", gap: 8, marginBottom: 3 },
  metaLabel: { fontSize: 8, color: GRAY, width: 80, textAlign: "right" },
  metaValue: { fontSize: 8, fontFamily: "Helvetica-Bold", width: 80, textAlign: "right" },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14, padding: 8, borderWidth: 0.5, borderColor: BORDER, borderRadius: 3 },
  infoItem: { width: "50%", flexDirection: "row", marginBottom: 4 },
  infoKey: { fontSize: 8, fontFamily: "Helvetica-Bold", color: GRAY, width: 80 },
  infoVal: { fontSize: 8, flex: 1 },
  table: { marginBottom: 12 },
  tHead: { flexDirection: "row", backgroundColor: BLUE, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 2 },
  tRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  tRowAlt: { backgroundColor: LIGHT },
  th: { color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 8 },
  td: { fontSize: 8.5 },
  cNum: { width: "5%" }, cProduct: { width: "20%" }, cDesc: { flex: 1 }, cQty: { width: "10%", textAlign: "right" }, cUnit: { width: "12%", textAlign: "right" },
  section: { marginBottom: 12 },
  sTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#333", marginBottom: 5, paddingBottom: 3, borderBottomWidth: 0.5, borderBottomColor: BORDER },
  sText: { fontSize: 8.5, color: GRAY, lineHeight: 1.6 },
  declarationBox: { padding: 10, borderWidth: 0.5, borderColor: BORDER, borderRadius: 3, marginBottom: 14 },
  sigBlock: { marginTop: 12, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: BORDER },
  sigTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  sigLine: { fontSize: 8.5, color: GRAY, marginBottom: 2 },
  footer: { position: "absolute", bottom: 22, left: 45, right: 45, textAlign: "center", fontSize: 9, color: BLUE, fontFamily: "Helvetica-Bold", borderTopWidth: 0.5, borderTopColor: BORDER, paddingTop: 8 },
});

export interface DeliveryLineItem { item_number: number; product: string; description: string; quantity: number; unit: string; }
export interface CompanyInfo { name: string; address: string; ein?: string | null; }
export interface DeliveryPDFProps {
  delivery_number: string; date: string; purchase_order?: string | null; purchase_date?: string | null;
  commercial_invoice?: string | null; shipment_type?: string | null; tracking_number?: string | null;
  incoterms?: string | null; country_of_origin?: string | null;
  company: CompanyInfo; logoSrc: string;
  client: { name: string; company?: string | null; address?: string | null; email?: string | null };
  lineItems: DeliveryLineItem[]; notes?: string | null;
}

export default function DeliveryNoticePDF({ delivery_number, date, purchase_order, purchase_date, commercial_invoice, shipment_type, tracking_number, incoterms, country_of_origin, company, logoSrc, client, lineItems, notes }: DeliveryPDFProps) {
  const addressLines = company.address.split(",").map(l => l.trim()).filter(Boolean);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.companyBlock}>
            <Image src={logoSrc} style={s.logo} />
            <Text style={s.companyName}>{company.name}</Text>
            {addressLines.map((l, i) => <Text key={i} style={s.companyDetail}>{l}</Text>)}
          </View>
          <View style={s.titleBlock}>
            <Text style={s.titleText}>DELIVERY NOTES</Text>
          </View>
        </View>
        <View style={s.divider} />
        <View style={s.billingRow}>
          <View style={s.contactBlock}>
            <Text style={s.contactLine}><Text style={s.contactLabel}>Contact: </Text>{client.name}</Text>
            <Text style={s.contactLine}><Text style={s.contactLabel}>Company: </Text>{client.company ?? client.name}</Text>
            {client.address && <Text style={s.contactLine}><Text style={s.contactLabel}>Delivery Address: </Text>{client.address}</Text>}
            {client.email && <Text style={s.contactLine}><Text style={s.contactLabel}>E-mail: </Text>{client.email}</Text>}
          </View>
          <View style={s.metaBlock}>
            <View style={s.metaRow}><Text style={s.metaLabel}>Delivery Order No.:</Text><Text style={s.metaValue}>{delivery_number}</Text></View>
            <View style={s.metaRow}><Text style={s.metaLabel}>Date:</Text><Text style={s.metaValue}>{fmtDate(date)}</Text></View>
          </View>
        </View>
        <View style={s.infoGrid}>
          {purchase_order && <View style={s.infoItem}><Text style={s.infoKey}>Purchase Order:</Text><Text style={s.infoVal}>{purchase_order}</Text></View>}
          {purchase_date && <View style={s.infoItem}><Text style={s.infoKey}>Purchase Date:</Text><Text style={s.infoVal}>{fmtDate(purchase_date)}</Text></View>}
          {commercial_invoice && <View style={s.infoItem}><Text style={s.infoKey}>Commercial Invoice:</Text><Text style={s.infoVal}>{commercial_invoice}</Text></View>}
          {shipment_type && <View style={s.infoItem}><Text style={s.infoKey}>Shipment Type:</Text><Text style={s.infoVal}>{shipment_type}</Text></View>}
          {tracking_number && <View style={s.infoItem}><Text style={s.infoKey}>Tracking Number:</Text><Text style={s.infoVal}>{tracking_number}</Text></View>}
          {incoterms && <View style={s.infoItem}><Text style={s.infoKey}>Incoterms:</Text><Text style={s.infoVal}>{incoterms}</Text></View>}
        </View>
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.th, s.cNum]}>Item</Text>
            <Text style={[s.th, s.cProduct]}>Product</Text>
            <Text style={[s.th, s.cDesc]}>Description</Text>
            <Text style={[s.th, s.cQty]}>QTY</Text>
            <Text style={[s.th, s.cUnit]}>Unit</Text>
          </View>
          {lineItems.map((item, i) => (
            <View key={i} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
              <Text style={[s.td, s.cNum]}>{item.item_number}</Text>
              <Text style={[s.td, s.cProduct]}>{item.product}</Text>
              <Text style={[s.td, s.cDesc]}>{item.description}</Text>
              <Text style={[s.td, s.cQty]}>{item.quantity}</Text>
              <Text style={[s.td, s.cUnit]}>{item.unit}</Text>
            </View>
          ))}
        </View>
        {notes && (
          <View style={s.section}>
            <Text style={s.sTitle}>NOTES:</Text>
            {notes.split("\n").filter(Boolean).map((line, i) => (
              <Text key={i} style={s.sText}>{line}</Text>
            ))}
            {country_of_origin && <Text style={[s.sText, { marginTop: 4 }]}>Country of origin: {country_of_origin}</Text>}
          </View>
        )}
        {!notes && country_of_origin && (
          <View style={s.section}>
            <Text style={s.sTitle}>NOTES:</Text>
            <Text style={s.sText}>Country of origin: {country_of_origin}</Text>
          </View>
        )}
        <View style={s.declarationBox}>
          <Text style={[s.sTitle, { borderBottomWidth: 0, marginBottom: 4 }]}>Supplier Declaration</Text>
          <Text style={s.sText}>We hereby declare that the goods described above are delivered in full compliance with the referenced Purchase Order, applicable technical specifications, and European regulations.</Text>
        </View>
        <View style={s.sigBlock}>
          <Text style={s.sigTitle}>Supplier Signature</Text>
          <Text style={s.sigLine}>For and on behalf of {company.name}</Text>
          <Text style={s.sigLine}>Name: ___________________________</Text>
          <Text style={s.sigLine}>Title: ___________________________</Text>
        </View>
        <Text style={s.footer}>Thank you for doing business with us!  —  {company.name}</Text>
      </Page>
    </Document>
  );
}
