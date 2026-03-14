import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { LOCACOES_LOGO } from "./locacoes-logo";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function fmtDateBR(d: string): string {
  const [y, m, day] = d.split("T")[0].split("-").map(Number);
  return `${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

function parseDateParts(d: string): { day: number; month: string; year: number } {
  const [y, m, day] = d.split("T")[0].split("-").map(Number);
  return { day, month: MESES[m - 1], year: y };
}

function fmtBRL(n: number): string {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#222",
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 45,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  body: {
    fontSize: 9,
    lineHeight: 1.6,
    textAlign: "justify",
    marginBottom: 6,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 4,
  },
  clauseTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginTop: 10,
    marginBottom: 2,
  },
  clause: {
    fontSize: 9,
    lineHeight: 1.6,
    textAlign: "justify",
    marginBottom: 6,
  },
  fieldRow: {
    fontSize: 9,
    lineHeight: 1.6,
    marginBottom: 2,
  },
  sigRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  sigBlock: {
    width: "45%",
    alignItems: "center",
  },
  sigLine: {
    fontSize: 9,
    marginBottom: 3,
  },
  sigUnderline: {
    width: "100%",
    borderBottomWidth: 0.5,
    borderBottomColor: "#222",
    marginBottom: 4,
  },
  spacer: {
    height: 8,
  },
});

export interface RentalContractPDFProps {
  nome_completo: string;
  cpf_cnpj: string;
  email: string;
  endereco: string;
  telefone: string;
  data_evento: string;
  endereco_entrega: string;
  horario_inicio: string;
  horario_fim: string;
  responsavel_nome: string;
  responsavel_telefone: string;
  brinquedos: string;
  uso_monitor: boolean;
  qtd_monitores: number;
  valor: number;
  valor_extenso: string;
  horas_contratadas: number;
  contract_date: string;
}

export default function RentalContractPDF(props: RentalContractPDFProps) {
  const {
    nome_completo,
    cpf_cnpj,
    email,
    endereco,
    telefone,
    data_evento,
    endereco_entrega,
    horario_inicio,
    horario_fim,
    responsavel_nome,
    responsavel_telefone,
    brinquedos,
    uso_monitor,
    qtd_monitores,
    valor,
    valor_extenso,
    horas_contratadas,
    contract_date,
  } = props;

  const { day, month, year } = parseDateParts(contract_date);
  const valorFmt = fmtBRL(valor);

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header with logo */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
          <Image src={LOCACOES_LOGO} style={{ width: 52, height: 52 }} />
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: "#E5A826", marginBottom: 2 }}>KEZPO LOCAÇÕES</Text>
            <Text style={s.title}>Contrato de Locação</Text>
          </View>
        </View>

        {/* LOCADORA */}
        <Text style={s.body}>
          <Text style={s.bold}>LOCADORA: KEZPO LOCAÇÕES</Text>, inscrita no{" "}
          <Text style={s.bold}>CNPJ sob o número 51805917/0001-02</Text>, Rua Safiras, 529, Jardim Boa Vista, Campo Magro-PR
        </Text>

        {/* LOCATÁRIO */}
        <Text style={s.body}>
          <Text style={s.bold}>LOCATÁRIO: {nome_completo}</Text>, inscrito no{" "}
          <Text style={s.bold}>CPF/CNPJ sob o número {cpf_cnpj}</Text>, endereço eletrônico {email}, endereço residencial {endereco}, contato telefone {telefone}
        </Text>

        {/* Intro text */}
        <Text style={s.body}>
          Os brinquedos infláveis serão locados na modalidade de horas, sendo assim, o{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> terá direito de utilizar os brinquedos, objeto deste contrato na data a seguir convencionada:
        </Text>

        {/* Event details */}
        <Text style={s.fieldRow}>
          <Text style={s.bold}>Data do Evento: </Text>{fmtDateBR(data_evento)}
        </Text>
        <Text style={s.fieldRow}>
          <Text style={s.bold}>Endereço do Entrega: </Text>{endereco_entrega}
        </Text>
        <Text style={s.fieldRow}>
          <Text style={s.bold}>Horário: </Text>{horario_inicio} ate {horario_fim}
        </Text>

        <View style={s.spacer} />

        {/* RESPONSAVEL */}
        <Text style={s.sectionTitle}>RESPONSAVEL EM RECEBER OS BRINQUEDOS</Text>
        <Text style={s.fieldRow}>
          <Text style={s.bold}>Nome: </Text>{responsavel_nome}
        </Text>
        <Text style={s.fieldRow}>
          <Text style={s.bold}>Telefone: </Text>{responsavel_telefone}
        </Text>

        <View style={s.spacer} />

        {/* BRINQUEDO */}
        <Text style={s.fieldRow}>
          <Text style={s.bold}>BRINQUEDO: </Text>{brinquedos}
        </Text>

        <View style={s.spacer} />

        {/* USO DE MONITOR */}
        <Text style={s.sectionTitle}>USO DE MONITOR</Text>
        <Text style={s.fieldRow}>{uso_monitor ? "Sim" : "Não"}</Text>
        <Text style={s.fieldRow}>Quantos? {qtd_monitores}</Text>

        {/* DO OBJETO DO CONTRATO */}
        <Text style={s.clauseTitle}>DO OBJETO DO CONTRATO</Text>
        <Text style={s.clause}>
          <Text style={s.bold}>Cláusula 1ª.</Text> O presente contrato tem como{" "}
          <Text style={s.bold}>OBJETIVO</Text> a locação de brinquedo(s) descrito(s) acima, de propriedade da{" "}
          <Text style={s.bold}>LOCADORA</Text>
        </Text>

        {/* DO USO */}
        <Text style={s.clauseTitle}>DO USO</Text>
        <Text style={s.clause}>
          <Text style={s.bold}>Cláusula 2ª.</Text> Os Brinquedos, objeto deste contrato, serão utilizados para um evento que o{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> está organizando. Os brinquedos serão destinados somente para o uso de crianças e/ou adultos, conforme orientação do fabricante de cada brinquedo, bem como da altura e peso tolerado por cada brinquedo. Ficará por conta do{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> a contratação de monitores para acompanhar e orientar a utilização adequada dos brinquedos.
        </Text>
        <Text style={s.clause}>
          Parágrafo único: Os monitores contratados através deste contrato irão acompanhar somente os brinquedos de propriedade da{" "}
          <Text style={s.bold}>LOCADORA</Text> deste contrato, não sendo responsáveis por brinquedos de outra empresa de locação de brinquedos. Caso o{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> decida pela não contratação de monitor(es) ficará desde logo responsável e arcará com a reparação de quaisquer danos materiais aos equipamentos, bem como exime a{" "}
          <Text style={s.bold}>LOCADORA</Text> de qualquer dano físico causado a usuário dos brinquedos.
        </Text>

        {/* VALOR DO ALUGUEL */}
        <Text style={s.clauseTitle}>VALOR DO ALUGUEL</Text>
        <Text style={s.clause}>
          <Text style={s.bold}>Cláusula 3ª.</Text> O{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> pagará pelo aluguel do objeto o valor de R$ {valorFmt} ({valor_extenso}) por um período de {horas_contratadas} horas
        </Text>
        <Text style={s.clause}>
          <Text style={s.bold}>Cláusula 4ª.</Text> O aluguel devera ser pago 50% no ato da reserva e o saldo até o dia do evento, no ato da entrega
        </Text>

        {/* DO PRAZO */}
        <Text style={s.clauseTitle}>DO PRAZO</Text>
        <Text style={s.clause}>
          <Text style={s.bold}>Cláusula 5ª.</Text> A presente locação terá o tempo de {horas_contratadas} horas, sendo que ao término desse período o objeto será retirado, conforme convencionado neste contrato.
        </Text>
        <Text style={s.clause}>
          <Text style={s.bold}>Parágrafo único:</Text> As horas excedentes utilizadas serão cobradas o valor de R$120,00 (cento e vinte) por hora
        </Text>

        {/* DA ISENÇÃO SOBRE OS DANOS SOFRIDOS */}
        <Text style={s.clauseTitle}>DA ISENÇÃO SOBRE OS DANOS SOFRIDOS</Text>
        <Text style={s.clause}>
          <Text style={s.bold}>Cláusula 6ª.</Text> A{" "}
          <Text style={s.bold}>LOCADORA</Text> se exime de qualquer responsabilidade sobre acidentes sofridos dentro dos brinquedos, não havendo obrigação deste em reparar qualquer dano físico ou material sofrido durante o uso dos objetos. O{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> por motivos de segurança deverá obrigatoriamente receber e concordar com procedimentos de segurança relativos ao brinquedo contratado especificado pela{" "}
          <Text style={s.bold}>LOCADORA</Text>.
        </Text>
        <Text style={s.clause}>
          O LOCATÁRIO se responsabiliza por qualquer dano aos brinquedos que impossibilite o seu uso em outros eventos, caso danifique, o LOCATÁRIO deverá restituir o valor TOTAL ou PARCIAL (caso seja possível conserto) do mesmo a LOCADORA.
        </Text>

        <Text style={s.clause}>
          <Text style={s.bold}>Cláusula 7ª.</Text> O{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> assume a responsabilidade de encontrar um local adequado para o(s) brinquedo(s) locado(s) caso na data do evento o tempo esteja chuvoso, pois não é possível a montagem dos brinquedos expostos á chuva por se tratar de brinquedos elétricos, e a impossibilidade por este motivo não obriga a{" "}
          <Text style={s.bold}>LOCADORA</Text> a fazer a devolução do valor monetário dado como sinal, caso disponível em agenda pode-se agendar outra data e utilizar o valor como parte de pagamento.
        </Text>
        <Text style={s.clause}>
          <Text style={s.bold}>PARÁGRAFO ÚNICO:</Text> em caso de chuvas e temporais, ficará o{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> responsável pela salvaguarda dos brinquedos, ficando desde já responsável por restituir a coisa no estado em que foi entregue, reparando os danos causados.
        </Text>

        {/* DO CANCELAMENTO */}
        <Text style={s.clauseTitle}>DO CANCELAMENTO</Text>
        <Text style={s.clause}>
          <Text style={s.bold}>Cláusula 8ª.</Text> O{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> poderá cancelar a reserva de brinquedos sem penalidades até 15 dias antes da data do evento agendado. Para cancelamento com menos de 15 antes da data do evento, deverá ser observado:
        </Text>
        <Text style={s.clause}>
          Cancelamento feito entre 14 e 7 dias antes da data do evento, ficará autorizada a{" "}
          <Text style={s.bold}>LOCADORA</Text> a reter 30% do valor total do aluguel do objeto contratado;
        </Text>
        <Text style={s.clause}>
          Cancelamento feito com menos de 7 dias antes da data do evento resultarão na perda do depósito efetuado para reserva ou pagamento integral do valor do aluguel, a depende do contrato convencionado;
        </Text>
        <Text style={s.clause}>
          Cancelamento devido a Condições Climáticas: Se as condições climáticas apresentarem riscos à segurança do evento (como ventos fortes ou tempestades), o{" "}
          <Text style={s.bold}>LOCATÁRIO</Text> poderá cancelar ou adiar o aluguel sem incorrer em penalidades. Somente para situações climáticas.
        </Text>
        <Text style={s.clause}>
          Reagendamento: Os clientes têm a opção de reagendar o evento para uma data futura, sujeita à disponibilidade, não sendo necessário cancelar por completo a reserva efetuada.
        </Text>
        <Text style={s.clause}>
          Comunicação de Cancelamento: Todos os cancelamentos devem ser comunicados por escrito, seja por e-mail ou WhatsApp, à empresa de aluguel de brinquedos infláveis. O cancelamento não será considerado válido até que seja confirmado pela empresa.
        </Text>
        <Text style={s.clause}>
          Em caso de cancelamento por parte da LOCADORA, brinquedo sem condições de uso na data, esse deverá substituir por brinquedo equivalente, ou reembolsar 100% do valor pago.
        </Text>
        <Text style={s.clause}>
          Ao reservar um brinquedo, o LOCADOR concorda com os termos e condições estabelecidas neste contrato de locação, incluindo a política de cancelamento.
        </Text>
        <Text style={s.clause}>
          Esta política de cancelamento é aplicável a todas as reservas de brinquedos feitas com{" "}
          <Text style={s.bold}>KEZPO LOCAÇÕES</Text>. Quaisquer exceções a esta política estão sujeitas a aprovação da administração da empresa.
        </Text>

        {/* CLAUSULA 8ª (legal framework) */}
        <Text style={s.clause}>
          <Text style={s.bold}>CLÁUSULA 8ª:</Text> O presente instrumento estará sob a égide do{" "}
          <Text style={s.bold}>CÓDIGO CIVIL BRASILEIRO, CODIGO DE PROCESSO CIVIL e CÓDIGO DE DEFESA DO CONSUMIDOR</Text> ou outra que a modificar ou substituir, ficando asseguradas as partes e todos os direitos e vantagens conferidas pela legislação que vier a vigorar durante esta locação.
        </Text>

        {/* CLAUSULA 9ª */}
        <Text style={s.clause}>
          <Text style={s.bold}>CLAUSULA 9ª:</Text> Fica eleito pelas partes contratantes o foro da Comarca de Curitiba – PR, para dirimir quaisquer questões oriundas da interpretação ou aplicação deste contrato, renunciando a qualquer outro, por mais privilegiado que seja. E, por estarem assim convencionadas, as partes assinam o presente instrumento particular em 02 (duas vias) de igual teor, dando ciência a todas as cláusulas e, dão fé.
        </Text>

        {/* Date line */}
        <Text style={[s.body, { marginTop: 16, textAlign: "center" }]}>
          Campo Magro, {day} de {month} de {year}.
        </Text>

        {/* Signatures */}
        <View style={s.sigRow}>
          <View style={s.sigBlock}>
            <View style={s.sigUnderline} />
            <Text style={s.sigLine}>Locadora: KEZPO LOCAÇÕES</Text>
            <Text style={s.sigLine}>CNPJ: 51805917/0001-02</Text>
          </View>
          <View style={s.sigBlock}>
            <View style={s.sigUnderline} />
            <Text style={s.sigLine}>Locador: {nome_completo}</Text>
            <Text style={s.sigLine}>CPF: {cpf_cnpj}</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
