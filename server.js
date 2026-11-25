/**
 * Gateway server and main entrypoint
 */
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const { NodeGateway, NodeCompose } = require('./node-gateway');
const { server: serverProduct } = require('./server-product');
const { server: serverReview } = require('./server-review');

const BASE_PORT = 8000;

const SERVERS = [
  { name: 'product', label: '📦 product', server: serverProduct },
  { name: 'review', label: '🆒 review', server: serverReview },
];

async function startServers() {
  const res = SERVERS.map(async ({ server, name, label }, index) => {
    const number = index + 1;
    const { url } = await startStandaloneServer(server, {
      listen: { port: BASE_PORT + number },
    });

    console.log(`${label} up at ${url}`);
    return { name, url };
  });

  return await Promise.all(res);
}

async function main() {
  const subgraphs = await startServers();
  const gateway = new NodeGateway({
    supergraphSdl: new NodeCompose({ subgraphs }),
    serviceHealthCheck: true,
  });
  const server = new ApolloServer({ gateway });
  const info = await startStandaloneServer(server, {
    listen: { port: BASE_PORT },
  });

  console.log(`\n--\n\n🌍 gateway up at ${info.url}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
