const unidades = [
  "", "um", "dois", "tres", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
];

const dezenas = [
  "", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa",
];

const centenas = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];

function tresDigitos(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";

  const c = Math.floor(n / 100);
  const resto = n % 100;

  const parts: string[] = [];

  if (c > 0) {
    parts.push(centenas[c]);
  }

  if (resto > 0) {
    if (resto < 20) {
      parts.push(unidades[resto]);
    } else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      if (u > 0) {
        parts.push(dezenas[d] + " e " + unidades[u]);
      } else {
        parts.push(dezenas[d]);
      }
    }
  }

  return parts.join(" e ");
}

function inteiroParaExtenso(n: number): string {
  if (n === 0) return "zero";

  const parts: string[] = [];

  const milhoes = Math.floor(n / 1_000_000);
  const milhares = Math.floor((n % 1_000_000) / 1_000);
  const resto = n % 1_000;

  if (milhoes > 0) {
    if (milhoes === 1) {
      parts.push("um milhao");
    } else {
      parts.push(tresDigitos(milhoes) + " milhoes");
    }
  }

  if (milhares > 0) {
    if (milhares === 1) {
      parts.push("mil");
    } else {
      parts.push(tresDigitos(milhares) + " mil");
    }
  }

  if (resto > 0) {
    parts.push(tresDigitos(resto));
  }

  // Join with " e " only when the last group is < 100 or when connecting groups
  if (parts.length === 1) return parts[0];

  // If last part represents a value < 100, join with "e"
  const last = parts[parts.length - 1];
  const init = parts.slice(0, -1).join(", ");

  // Use "e" between last two groups when last group < 100 or is exact hundreds
  if (resto > 0 && resto < 100) {
    return init + " e " + last;
  }
  if (resto === 100 || (resto > 0 && resto % 100 === 0)) {
    return init + " e " + last;
  }

  // For values like "mil cento e vinte", connect with " "
  if (parts.length === 2) {
    return parts[0] + " e " + parts[1];
  }

  return init + " " + last;
}

export function numberToWordsPT(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const intPart = Math.floor(rounded);
  const decPart = Math.round((rounded - intPart) * 100);

  let result = "";

  if (intPart === 0 && decPart === 0) {
    return "zero reais";
  }

  if (intPart > 0) {
    const extenso = inteiroParaExtenso(intPart);
    if (intPart === 1) {
      result = extenso + " real";
    } else {
      result = extenso + " reais";
    }
  }

  if (decPart > 0) {
    const centavosExtenso = inteiroParaExtenso(decPart);
    const centavosLabel = decPart === 1 ? "centavo" : "centavos";
    if (intPart > 0) {
      result += " e " + centavosExtenso + " " + centavosLabel;
    } else {
      result = centavosExtenso + " " + centavosLabel;
    }
  }

  return result;
}
