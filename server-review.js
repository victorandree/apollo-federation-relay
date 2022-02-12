/**
 * Review service
 */

const { ApolloServer, gql } = require('apollo-server');
const { buildSubgraphSchema } = require('@apollo/federation');
const { toRecords } = require('./util');
const GraphQLNode = require('./graphql-node');
const { connectionFromArray } = require('graphql-relay');

const { toId } = GraphQLNode;

const REVIEWS = [
  {
    id: toId('Review', '1'),
    body: `It's OK!`,
    rating: 5,
    node: { id: toId('Product', '1') },
  },
  {
    id: toId('Review', '2'),
    body: `It's pretty good!`,
    rating: 2,
    node: { id: toId('Product', '1') },
  },
  {
    id: toId('Review', '3'),
    body: `It's really bad`,
    rating: 1,
    node: { id: toId('Product', '1') },
  },
];

const REVIEWS_MAP = toRecords(REVIEWS);

const typeDefs = gql`
  type Query {
    node(id: ID!): Node
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
    reviews(
      after: String
      first: Int
      before: String
      last: Int
    ): ReviewConnection
  }

  type ReviewConnection {
    pageInfo: PageInfo!
    edges: [ReviewEdge]
  }

  type ReviewEdge {
    node: Review
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;

const nodeTypes = new Set(['Review']);

const resolvers = {
  Query: {
    node(_, { id }) {
      const [typename] = GraphQLNode.fromId(id);
      if (!nodeTypes.has(typename)) {
        throw new Error(`Invalid node ID "${id}"`);
      }

      return REVIEWS_MAP[id];
    },
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
    reviews(product, args) {
      const data = REVIEWS.filter(({ node }) => node && node.id === product.id);
      return connectionFromArray(data, args);
    },
  },
};

exports.server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }, GraphQLNode]),
});
