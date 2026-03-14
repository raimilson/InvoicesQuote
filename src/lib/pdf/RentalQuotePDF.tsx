import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { LOCACOES_LOGO } from "./locacoes-logo";

function fmtDateBR(d: string): string {
  const [y, m, day] = d.split("T")[0].split("-").map(Number);
  return `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function fmtBRL(n: number): string {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

const BLUE = "#2AABE2";
const GRAY = "#555555";
const BORDER = "#e0e0e0";
const LIGHT = "#f8f8f8";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#222",
    paddingTop: 40,
    paddingBottom: 52,
    paddingHorizontal: 45,
    backgroundColor: "#fff",
  },
  /* Header */
  header: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#333",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 4,
  },
  metaItem: {
    fontSize: 9,
    color: GRAY,
  },
  metaLabel: {
    fontFamily: "Helvetica-Bold",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginBottom: 16,
  },
  /* Client section */
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#333",
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  fieldLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    width: 80,
  },
  fieldValue: {
    fontSize: 8.5,
    flex: 1,
  },
  sectionSpacer: {
    height: 14,
  },
  /* Table */
  table: {
    marginBottom: 6,
  },
  tHead: {
    flexDirection: "row",
    backgroundColor: BLUE,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  tRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  tRowAlt: {
    backgroundColor: LIGHT,
  },
  th: {
    color: "#fff",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  td: {
    fontSize: 8.5,
  },
  cDesc: { flex: 1 },
  cQty: { width: "10%", textAlign: "center" },
  cUnit: { width: "18%", textAlign: "right" },
  cTotal: { width: "18%", textAlign: "right" },
  /* Totals */
  totalsSection: {
    alignItems: "flex-end",
    marginTop: 6,
    marginBottom: 20,
  },
  totRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    width: 230,
  },
  totLabel: {
    flex: 1,
    fontSize: 8.5,
    color: GRAY,
    textAlign: "right",
    paddingRight: 12,
  },
  totValue: {
    width: 90,
    fontSize: 8.5,
    textAlign: "right",
  },
  grandRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderTopWidth: 1.5,
    borderTopColor: "#bbb",
    marginTop: 3,
    width: 230,
  },
  grandLabel: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    paddingRight: 12,
  },
  grandValue: {
    width: 90,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  /* Notes */
  notesSection: {
    marginBottom: 16,
  },
  notesText: {
    fontSize: 8.5,
    color: GRAY,
    lineHeight: 1.6,
  },
  /* Footer */
  footerSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
  },
  footerLine: {
    fontSize: 8.5,
    color: GRAY,
    marginBottom: 3,
  },
  footerBold: {
    fontFamily: "Helvetica-Bold",
    color: "#333",
  },
  bottomFooter: {
    position: "absolute",
    bottom: 22,
    left: 45,
    right: 45,
    textAlign: "center",
    fontSize: 9,
    color: BLUE,
    fontFamily: "Helvetica-Bold",
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
});

export interface RentalQuoteItem {
  product_name: string;
  quantidade: number;
  preco_unit: number;
  total: number;
}

export interface RentalQuotePDFProps {
  quote_number: string;
  date: string;
  client: { nome_completo: string; telefone?: string; email?: string };
  data_evento: string;
  endereco_entrega: string;
  horario_inicio: string;
  horario_fim: string;
  items: RentalQuoteItem[];
  subtotal: number;
  desconto: number;
  total: number;
  notes?: string;
}

export default function RentalQuotePDF(props: RentalQuotePDFProps) {
  const {
    quote_number,
    date,
    client,
    data_evento,
    endereco_entrega,
    horario_inicio,
    horario_fim,
    items,
    subtotal,
    desconto,
    total,
    notes,
  } = props;

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Image src={LOCACOES_LOGO} style={{ width: 48, height: 48 }} />
            <View>
              <Text style={s.companyName}>KEZPO LOCAÇÕES</Text>
              <Text style={s.subtitle}>Orçamento</Text>
            </View>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaItem}>
              <Text style={s.metaLabel}>Nº: </Text>{quote_number}
            </Text>
            <Text style={s.metaItem}>
              <Text style={s.metaLabel}>Data: </Text>{fmtDateBR(date)}
            </Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Client */}
        <Text style={s.sectionTitle}>Cliente</Text>
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Nome:</Text>
          <Text style={s.fieldValue}>{client.nome_completo}</Text>
        </View>
        {client.telefone && (
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>Telefone:</Text>
            <Text style={s.fieldValue}>{client.telefone}</Text>
          </View>
        )}
        {client.email && (
          <View style={s.fieldRow}>
            <Text style={s.fieldLabel}>E-mail:</Text>
            <Text style={s.fieldValue}>{client.email}</Text>
          </View>
        )}

        <View style={s.sectionSpacer} />

        {/* Event */}
        <Text style={s.sectionTitle}>Evento</Text>
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Data:</Text>
          <Text style={s.fieldValue}>{fmtDateBR(data_evento)}</Text>
        </View>
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Endereço:</Text>
          <Text style={s.fieldValue}>{endereco_entrega}</Text>
        </View>
        <View style={s.fieldRow}>
          <Text style={s.fieldLabel}>Horário:</Text>
          <Text style={s.fieldValue}>{horario_inicio} até {horario_fim}</Text>
        </View>

        <View style={s.sectionSpacer} />

        {/* Products table */}
        <Text style={s.sectionTitle}>Itens</Text>
        <View style={s.table}>
          <View style={s.tHead}>
            <Text style={[s.th, s.cDesc]}>Brinquedo</Text>
            <Text style={[s.th, s.cQty]}>Qtd</Text>
            <Text style={[s.th, s.cUnit]}>Preço Unit.</Text>
            <Text style={[s.th, s.cTotal]}>Total</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={[s.tRow, i % 2 === 1 ? s.tRowAlt : {}]}>
              <Text style={[s.td, s.cDesc]}>{item.product_name}</Text>
              <Text style={[s.td, s.cQty]}>{item.quantidade}</Text>
              <Text style={[s.td, s.cUnit]}>R$ {fmtBRL(item.preco_unit)}</Text>
              <Text style={[s.td, s.cTotal]}>R$ {fmtBRL(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={s.totalsSection}>
          <View style={s.totRow}>
            <Text style={s.totLabel}>Subtotal</Text>
            <Text style={s.totValue}>R$ {fmtBRL(subtotal)}</Text>
          </View>
          {desconto > 0 && (
            <View style={s.totRow}>
              <Text style={s.totLabel}>Desconto</Text>
              <Text style={s.totValue}>- R$ {fmtBRL(desconto)}</Text>
            </View>
          )}
          <View style={s.grandRow}>
            <Text style={s.grandLabel}>Total</Text>
            <Text style={s.grandValue}>R$ {fmtBRL(total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {notes && (
          <View style={s.notesSection}>
            <Text style={s.sectionTitle}>Observações</Text>
            <Text style={s.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer terms */}
        <View style={s.footerSection}>
          <Text style={s.footerLine}>
            <Text style={s.footerBold}>Validade: </Text>7 dias
          </Text>
          <Text style={s.footerLine}>
            <Text style={s.footerBold}>Pagamento: </Text>50% no ato da reserva, saldo no dia do evento
          </Text>
        </View>

        {/* Bottom footer */}
        <Text style={s.bottomFooter}>KEZPO LOCAÇÕES — Rua Safiras, 529, Jardim Boa Vista, Campo Magro-PR</Text>

      </Page>
    </Document>
  );
}
