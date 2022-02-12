/**
 * Gateway server and main entrypoint
 */
const { ApolloServer } = require('apollo-server');

const { NodeGateway, NodeCompose } = require('./node-gateway');
const { server: serverProduct } = require('./server-product');
const { server: serverReview } = require('./server-review');

const BASE_PORT = 8000;

const SERVERS = [
  { name: '📦 product', server: serverProduct },
  { name: '🆒 review', server: serverReview },
];

async function startServers() {
  const res = SERVERS.map(async ({ server, name }, index) => {
    const number = index + 1;
    const { url } = await server.listen(BASE_PORT + number);

    console.log(`${name} up at ${url}graphql`);
    return { name, url };
  });

  return await Promise.all(res);
}

async function main() {
  const subgraphs = await startServers();
  const supergraphSdl = new NodeCompose({
    subgraphs,
  })
  const gateway = new NodeGateway({ supergraphSdl, serviceHealthCheck: true });
  const server = new ApolloServer({ gateway, subscriptions: false });
  const info = await server.listen(BASE_PORT);

  console.log(`\n--\n\n🌍 gateway up at ${info.url}graphql`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
