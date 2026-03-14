import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Pula-Pula Branco - Sem motor/monitor',
    description: 'Pula-pula branco inflável para locação. Sem motor e sem monitor inclusos.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_36ad20dfc1734533be5e7868619314cc~mv2.png/v1/fit/w_1080,h_1080,al_c/f4197e_36ad20dfc1734533be5e7868619314cc~mv2.png',
  },
  {
    name: 'Mini Pula-Pula Branco - Sem monitor',
    description: 'Mini pula-pula branco inflável para locação. Sem monitor incluso.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_36ad20dfc1734533be5e7868619314cc~mv2.png/v1/fit/w_1080,h_1080,al_c/f4197e_36ad20dfc1734533be5e7868619314cc~mv2.png',
  },
  {
    name: 'Piscina de Bolinhas Branca - Sem monitor',
    description: 'Piscina de bolinhas branca para locação. Sem monitor incluso.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_60452ad1618446a99b7b08223c995c17~mv2.png/v1/fit/w_1081,h_1081,al_c/f4197e_60452ad1618446a99b7b08223c995c17~mv2.png',
  },
  {
    name: 'Piscina de Bolinhas Branca',
    description: 'Piscina de bolinhas branca para locação. Com monitor incluso.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_60452ad1618446a99b7b08223c995c17~mv2.png/v1/fit/w_1081,h_1081,al_c/f4197e_60452ad1618446a99b7b08223c995c17~mv2.png',
  },
  {
    name: 'Castelo c/ Escorrega Branco - Sem monitor',
    description: 'Castelo inflável com escorrega branco para locação. Sem monitor incluso.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_692352ebb30f4be2baa6fbf67f3a785f~mv2.png/v1/fit/w_1081,h_1081,al_c/f4197e_692352ebb30f4be2baa6fbf67f3a785f~mv2.png',
  },
  {
    name: 'Softplay - Kit Escorrega',
    description: 'Kit softplay com escorrega para locação de eventos infantis.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_f9a182d8daac427fbce309e157d600db~mv2.png/v1/fit/w_1081,h_1081,al_c/f4197e_f9a182d8daac427fbce309e157d600db~mv2.png',
  },
  {
    name: 'Bubble House com Pula-Pula',
    description: 'Bubble house com pula-pula para locação de eventos.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_3617a611200d41fc834814aec2e033f8~mv2.png/v1/fit/w_1081,h_1081,al_c/f4197e_3617a611200d41fc834814aec2e033f8~mv2.png',
  },
  {
    name: 'Bubble House com Pula-Pula - Menor',
    description: 'Bubble house com pula-pula versão menor para locação.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_3617a611200d41fc834814aec2e033f8~mv2.png/v1/fit/w_1081,h_1081,al_c/f4197e_3617a611200d41fc834814aec2e033f8~mv2.png',
  },
  {
    name: 'Mesa Kids - Sem Monitor',
    description: 'Mesa infantil para locação. Sem monitor incluso.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_8c23275e0e784be3833c9cec0e872d57~mv2.png/v1/fit/w_1080,h_1080,al_c/f4197e_8c23275e0e784be3833c9cec0e872d57~mv2.png',
  },
  {
    name: 'Pula-Pula Branco - Sem motor',
    description: 'Pula-pula branco inflável para locação. Sem motor incluso, com monitor.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_36ad20dfc1734533be5e7868619314cc~mv2.png/v1/fit/w_1080,h_1080,al_c/f4197e_36ad20dfc1734533be5e7868619314cc~mv2.png',
  },
  {
    name: 'Piscina de Bolinhas Inflável',
    description: 'Piscina de bolinhas inflável para locação.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_2ac2502560b9491c802c9268a22e87c5~mv2.png/v1/fit/w_1081,h_1081,al_c/f4197e_2ac2502560b9491c802c9268a22e87c5~mv2.png',
  },
  {
    name: 'Pula-Pula Branco - Sem monitor',
    description: 'Pula-pula branco inflável para locação. Sem monitor incluso.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_a3f579c5657a4bc5b87befabb8f775fb~mv2.png',
  },
  {
    name: 'Softplay - Kit Equilíbrio',
    description: 'Kit softplay de equilíbrio para locação de eventos infantis.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_43a43488def74ed58245124da1aae020~mv2.png/v1/fit/w_1081,h_1081,al_c/f4197e_43a43488def74ed58245124da1aae020~mv2.png',
  },
  {
    name: '6 Banquinhos Kids - Sem Monitor',
    description: 'Kit com 6 banquinhos infantis para locação. Sem monitor incluso.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_61aeab651a064d55bd4214a2c3e1c299~mv2.png/v1/fit/w_1080,h_1080,al_c/f4197e_61aeab651a064d55bd4214a2c3e1c299~mv2.png',
  },
  {
    name: 'Pula-Pula Branco',
    description: 'Pula-pula branco inflável para locação. Com monitor incluso.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_a3f579c5657a4bc5b87befabb8f775fb~mv2.png/v1/fit/w_1080,h_1080,al_c/f4197e_a3f579c5657a4bc5b87befabb8f775fb~mv2.png',
  },
  {
    name: 'Castelo com Escorrega - Branco',
    description: 'Castelo inflável com escorrega branco para locação. Com monitor incluso.',
    price: 0,
    image_url: 'https://static.wixstatic.com/media/f4197e_692352ebb30f4be2baa6fbf67f3a785f~mv2.png',
  },
];

async function main() {
  console.log('Seeding 16 rental products from Wix catalog...\n');

  for (const product of products) {
    const created = await prisma.rentalProduct.create({
      data: product,
    });
    console.log(`  ✓ ${created.name} (id: ${created.id})`);
  }

  console.log(`\nDone! ${products.length} products created.`);
  console.log('NOTE: All prices are set to R$ 0.00 — update them via the admin panel.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
