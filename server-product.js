/**
 * Product service
 */

const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const GraphQLNode = require('./graphql-node');

const productId = (key) => GraphQLNode.toId('Product', key);

const PRODUCTS = {
  [productId('1')]: {
    id: productId('1'),
    name: 'My little product',
  },
};

const ALL_PRODUCTS = Object.values(PRODUCTS);

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
      return PRODUCTS[id];
    },

    products(_, { ids }) {
      if (!ids) {
        return ALL_PRODUCTS;
      }

      return ids.map(id => PRODUCTS[id] || null);
    }
  },

  Product: {
    __resolveReference(product) {
      return PRODUCTS[product.id];
    },
  },
};

exports.server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }, GraphQLNode]),
});
