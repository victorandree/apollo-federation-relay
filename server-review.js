/**
 * Review service
 */

const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');
const { toRecords } = require('./util');
const GraphQLNode = require('./graphql-node');

const { toId } = GraphQLNode;

const REVIEWS = [
  {
    id: toId('Review', '1'),
    body: `It's OK!`,
    rating: 5,
    node: { id: toId('Product', '1') },
  },
];

const REVIEWS_MAP = toRecords(REVIEWS);

const typeDefs = gql`
  type Query {
    review(id: ID!): Review
    reviews(ids: [ID!]): [Review]
  }

  type Review implements Node @key(fields: "id") {
    id: ID!
    body: String!
    rating: Int
    node: Node
  }

  extend type Product implements Node @key(fields: "id") {
    id: ID! @external
    reviews: [Review!]!
  }
`;

const resolvers = {
  Query: {
    review(_, { id }) {
      return REVIEWS_MAP[id];
    },

    reviews(_, { ids }) {
      if (!ids) {
        return REVIEWS;
      }

      return ids.map(id => REVIEWS_MAP[id] || null);
    },
  },

  Review: {
    __resolveReference(review) {
      return REVIEWS_MAP[review.id];
    },
  },

  Product: {
    reviews(product) {
      return REVIEWS.filter(({ node }) => node && node.id === product.id);
    },
  },
};

exports.server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }, GraphQLNode]),
});
