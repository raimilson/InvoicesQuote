const AUTENTIQUE_URL = "https://api.autentique.com.br/v2/graphql";
const AUTENTIQUE_TOKEN = process.env.AUTENTIQUE_API_TOKEN!;

interface CreateDocumentResult {
  id: string;
  name: string;
  signatures: {
    public_id: string;
    name: string;
    email: string;
    link: { short_link: string } | null;
    signed: { created_at: string } | null;
    rejected: { created_at: string } | null;
  }[];
}

function buildMultipartBody(
  operations: string,
  map: string,
  fileBuffer: Buffer,
  fileName: string
): { body: Buffer; contentType: string } {
  const boundary = "----AutentiqueBoundary" + Date.now().toString(36);
  const CRLF = "\r\n";

  const parts: Buffer[] = [];

  // operations part
  parts.push(Buffer.from(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="operations"${CRLF}` +
    `Content-Type: application/json${CRLF}${CRLF}` +
    operations + CRLF
  ));

  // map part
  parts.push(Buffer.from(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="map"${CRLF}` +
    `Content-Type: application/json${CRLF}${CRLF}` +
    map + CRLF
  ));

  // file part
  parts.push(Buffer.from(
    `--${boundary}${CRLF}` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}` +
    `Content-Type: application/pdf${CRLF}${CRLF}`
  ));
  parts.push(fileBuffer);
  parts.push(Buffer.from(CRLF));

  // closing boundary
  parts.push(Buffer.from(`--${boundary}--${CRLF}`));

  return {
    body: Buffer.concat(parts),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

export async function createDocumentForSignature(
  pdfBuffer: Buffer,
  documentName: string,
  signerName: string,
  signerEmail: string,
  message?: string
): Promise<CreateDocumentResult> {
  const mutation = `mutation CreateDocumentMutation($document: DocumentInput!, $signers: [SignerInput!]!, $file: Upload!) { createDocument(document: $document, signers: $signers, file: $file) { id name signatures { public_id name email link { short_link } signed { created_at } rejected { created_at } } } }`;

  const operations = JSON.stringify({
    query: mutation,
    variables: {
      document: { name: documentName },
      signers: [{ email: signerEmail, action: "SIGN" }],
      file: null,
    },
  });

  const map = JSON.stringify({ file: ["variables.file"] });

  const { body, contentType } = buildMultipartBody(
    operations,
    map,
    pdfBuffer,
    `${documentName}.pdf`
  );

  const response = await fetch(AUTENTIQUE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AUTENTIQUE_TOKEN}`,
      "Content-Type": contentType,
    },
    body: new Uint8Array(body),
  });

  const text = await response.text();

  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(`Autentique: resposta inválida (${response.status}): ${text.slice(0, 200)}`);
  }

  if (result.errors) {
    throw new Error(`Autentique: ${result.errors.map((e: any) => e.message).join(", ")}`);
  }

  if (!result.data?.createDocument) {
    throw new Error(`Autentique: resposta inesperada: ${text.slice(0, 200)}`);
  }

  return result.data.createDocument;
}

export async function getDocumentStatus(documentId: string) {
  const query = `query { document(id: "${documentId}") { id name signatures { public_id name email link { short_link } signed { created_at } rejected { created_at } email_events { sent opened delivered refused reason } } files { signed } } }`;

  const response = await fetch(AUTENTIQUE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AUTENTIQUE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const text = await response.text();

  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(`Autentique: resposta inválida (${response.status}): ${text.slice(0, 200)}`);
  }

  if (result.errors) {
    throw new Error(`Autentique: ${result.errors.map((e: any) => e.message).join(", ")}`);
  }

  return result.data.document;
}
