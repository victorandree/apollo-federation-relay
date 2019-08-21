/**
 * Node resolution service
 *
 * It should be possible to automatically generate the type definitions for
 * this service, in the gateway. It should also be possible to run it as a
 * local service on the gateway
 */
const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const GraphQLNode = require('./graphql-node');

const typeDefs = gql`
  type Query {
    node(id: ID!): Node
  }

  extend type Product implements Node @key(fields: "id") {
    id: ID! @external
  }

  extend type Review implements Node @key(fields: "id") {
    id: ID! @external
  }
`;

const resolvers = {
  Query: {
    node(_, { id }) {
      return { id };
    },
  },
};

exports.server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }, GraphQLNode]),
});
