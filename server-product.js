/**
 * Product service
 */

const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const { toRecords } = require('./util');
const GraphQLNode = require('./graphql-node');

const { toId } = GraphQLNode;

const PRODUCTS = [
  {
    id: toId('Product', '1'),
    name: 'My little product',
  },
];

const PRODUCTS_MAP = toRecords(PRODUCTS);

const typeDefs = gql`
  type Query {
    product(id: ID!): Product
    products(ids: [ID!]): [Product]
  }

  type Product implements Node @key(fields: "id") {
    id: ID!
    name: String!
  }
`;

const resolvers = {
  Query: {
    product(_, { id }) {
      return PRODUCTS_MAP[id];
    },

    products(_, { ids }) {
      if (!ids) {
        return PRODUCTS;
      }

      return ids.map(id => PRODUCTS_MAP[id] || null);
    },
  },

  Product: {
    __resolveReference(product) {
      return PRODUCTS_MAP[product.id];
    },
  },
};

exports.server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }, GraphQLNode]),
});
