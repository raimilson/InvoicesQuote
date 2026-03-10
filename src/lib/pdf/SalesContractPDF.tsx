import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { numberToWords } from "@/lib/numberToWords";

function fmtDate(d: string | Date): string {
  const months = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  if (typeof d === "string") {
    const [y, m, day] = d.split("T")[0].split("-").map(Number);
    return `${String(day).padStart(2,"0")}-${months[m - 1]}-${y}`;
  }
  return `${String(d.getUTCDate()).padStart(2,"0")}-${months[d.getUTCMonth()]}-${d.getUTCFullYear()}`;
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n);
}

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 9, color: "#222", paddingTop: 40, paddingBottom: 52, paddingHorizontal: 45, backgroundColor: "#fff" },
  title: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#1e7e34", textAlign: "center", marginBottom: 6 },
  contractMeta: { alignItems: "flex-end", marginBottom: 12 },
  contractMetaLine: { fontSize: 8.5, marginBottom: 2 },
  partyLine: { fontSize: 8.5, marginBottom: 3 },
  partyLabel: { fontFamily: "Helvetica-Bold" },
  divider: { height: 0.5, backgroundColor: "#555", marginBottom: 8 },
  agreementText: { fontSize: 8.5, marginBottom: 8, lineHeight: 1.5 },
  table: { marginBottom: 10 },
  tHead: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#444", paddingBottom: 4, marginBottom: 4 },
  tRow: { flexDirection: "row", paddingVertical: 3 },
  th: { fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  td: { fontSize: 8.5 },
  cService: { width: "20%" }, cDesc: { flex: 1 }, cQty: { width: "8%", textAlign: "center" },
  cUnit: { width: "10%", textAlign: "center" }, cPrice: { width: "14%", textAlign: "right" }, cAmt: { width: "14%", textAlign: "right" },
  totalBlock: { marginTop: 8, marginBottom: 10 },
  totalLine: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  amountWords: { fontSize: 9, fontFamily: "Helvetica-Bold", marginBottom: 14 },
  notesBlock: { marginBottom: 16 },
  notesBold: { fontSize: 8.5, lineHeight: 1.6, marginBottom: 2, fontFamily: "Helvetica-Bold" },
  noteLine: { fontSize: 8.5, lineHeight: 1.6, marginBottom: 2 },
  bankRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  bankColLeft: { flex: 3 },
  bankColRight: { flex: 2 },
  bankTitle: { fontSize: 8.5, marginBottom: 5 },
  bankLine: { fontSize: 8.5, marginBottom: 2 },
  bankLabel: { fontFamily: "Helvetica-Bold" },
  sigRow: { flexDirection: "row", marginBottom: 6 },
  sigSpacer: { flex: 1 },
  sigBlock: { flex: 1 },
  sigLine: { fontSize: 8.5, marginBottom: 3 },
  stampSection: { alignItems: "center", marginBottom: 10 },
  stampLine: { fontSize: 8.5 },
  bottomBorder: { height: 0.5, backgroundColor: "#555" },
});

export interface ContractLineItem { service: string; description: string; qty: number; unit: string; unit_price: number; amount: number; }

export interface SalesContractPDFProps {
  contract_number: string;
  date: string;
  lineItems: ContractLineItem[];
  total: number;
}

export default function SalesContractPDF({ contract_number, date, lineItems, total }: SalesContractPDFProps) {
  const totalStr = fmtNum(total);
  const amountInWords = numberToWords(total, "EUR");

  return (
    <Document>
      <Page size="A4" style={s.page}>

        <Text style={s.title}>SALES CONTRACT</Text>

        <View style={s.contractMeta}>
          <Text style={s.contractMetaLine}>Contract no.:  {contract_number}</Text>
          <Text style={s.contractMetaLine}>Date:{fmtDate(date)}</Text>
        </View>

        {/* Parties — hardcoded Mouette template */}
        <Text style={s.partyLine}><Text style={s.partyLabel}>PARTY A:  </Text>Kezpo SLLC</Text>
        <Text style={s.partyLine}><Text style={s.partyLabel}>ADD: </Text>1021 E Lincolnway Suite #8933, Cheyenne, Wyoming 82001, United States  EIN No.: 320823412</Text>
        <Text style={s.partyLine}><Text style={s.partyLabel}>PARTY B:  </Text>MOUETTE PLASTIC MOLD CO., LTD</Text>
        <Text style={[s.partyLine, { marginBottom: 12 }]}><Text style={s.partyLabel}>ADD: </Text>56, Liyuan Road, Xuejia, Xinbei District, Changzhou, 213125, Jiangsu, China  VAT(ID) No.: 91320404313753474</Text>

        <Text style={s.agreementText}>THE UNDER SIGNED BY PARTY A AND PARTY B HAVE AGREED TO CLOSE THE FOLLOWING TRANSACTIONS ACCORDING TO THE TERMS AND CONDITIONS STIPULATED BELOW:</Text>

        <View style={s.divider} />

        {/* Line items — dynamic */}
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.th, s.cService]}>Service</Text>
            <Text style={[s.th, s.cDesc]}>Description</Text>
            <Text style={[s.th, s.cQty]}>Qty</Text>
            <Text style={[s.th, s.cUnit]}>Unit</Text>
            <Text style={[s.th, s.cPrice]}>Unit Price</Text>
            <Text style={[s.th, s.cAmt]}>Amount</Text>
          </View>
          {lineItems.map((item, i) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.td, s.cService]}>{item.service}</Text>
              <Text style={[s.td, s.cDesc]}>{item.description}</Text>
              <Text style={[s.td, s.cQty]}>{item.qty}</Text>
              <Text style={[s.td, s.cUnit]}>{item.unit}</Text>
              <Text style={[s.td, s.cPrice]}>{"\u20AC"}{fmtNum(item.unit_price)}</Text>
              <Text style={[s.td, s.cAmt]}>{"\u20AC"}{fmtNum(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Total — dynamic */}
        <View style={s.totalBlock}>
          <Text style={s.totalLine}>Total Amount {"\u20AC"}{totalStr}</Text>
          <Text style={s.amountWords}>Say {amountInWords}</Text>
        </View>

        {/* Notes — hardcoded body, dynamic total */}
        <View style={s.notesBlock}>
          <Text style={s.notesBold}>"NOTES:</Text>
          <Text style={s.noteLine}>{"1). Party A will be responsible for Mr. Vittorio\u2019s project product design, total designed cost EURO "}{totalStr}</Text>
          <Text style={s.noteLine}>2). If any small change need to be made after the first molding test, Party A will be responsible for parts drawings adjusting or changing.</Text>
          <Text style={s.noteLine}>3). Any parts structure change will be offered accordingly.</Text>
          <Text style={s.noteLine}>4). Payment Term: Due on receipt EURO {totalStr}, will be paid by T/T before the design work.</Text>
          <Text style={s.noteLine}>{"5). Lead time of the design work: parts drawings will be provided in 7days after PARTY B arrange the deposit.\""}</Text>
        </View>

        {/* Bank details — hardcoded Mouette */}
        <View style={s.bankRow}>
          <View style={s.bankColLeft}>
            <Text style={s.bankTitle}>*Bank details:</Text>
            <Text style={s.bankLine}><Text style={s.bankLabel}>{"Beneficiary\u2019s bank:  "}</Text>Bank of China, Changzhou Branch</Text>
            <Text style={s.bankLine}><Text style={s.bankLabel}>Swift code: </Text>BKCHCNBJ95E</Text>
            <Text style={s.bankLine}><Text style={s.bankLabel}>Bank Address: </Text>21 Heping North Road, Changzhou, Jiangsu, China</Text>
            <Text style={s.bankLine}><Text style={s.bankLabel}>{"Beneficiary (Empfaenger):  "}</Text>Mouette Plastic Mold Co., Ltd</Text>
            <Text style={s.bankLine}><Text style={s.bankLabel}>Account number: </Text>471565750183*</Text>
          </View>
          <View style={s.bankColRight}>
            <Text style={s.bankTitle}>Bank details:</Text>
          </View>
        </View>

        {/* Signature — hardcoded */}
        <View style={s.sigRow}>
          <View style={s.sigSpacer} />
          <View style={s.sigBlock}>
            <Text style={s.sigLine}>_____________________</Text>
            <Text style={s.sigLine}>(Signature)  / Mr. Zheng Shuhan/</Text>
          </View>
        </View>

        <View style={s.stampSection}>
          <Text style={s.stampLine}>Company Stampe:</Text>
        </View>

        <View style={s.bottomBorder} />

      </Page>
    </Document>
  );
}
