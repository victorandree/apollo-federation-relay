const { gql } = require('apollo-server');

const DIVIDER_TOKEN = ':';

exports.typeDefs = gql`
  """
  An object with an ID.
  Follows the [Relay Global Object Identification Specification](https://relay.dev/graphql/objectidentification.htm)
  """
  interface Node {
    id: ID!
  }
`;

exports.resolvers = {
  Node: {
    __resolveType({ id }) {
      // TODO: Add validation around `fromId`
      const [typename] = fromId(id);
      return typename;
    },
  },
};

/**
 * Decodes a Base64 encoded global ID into typename and key
 *
 * @param {string} id Base64 encoded Node ID
 * @returns {[string, Buffer]} A tuple of the decoded typename and key.
 *   The key is not decoded, since it may be binary. There's no validation
 *   of the typename.
 * @throws {RangeError} If id cannot be decoded
 */
function fromId(id) {
  const b = Buffer.from(id, 'base64');
  const i = b.indexOf(DIVIDER_TOKEN);

  if (i === -1) {
    throw new RangeError('Invalid Node ID');
  }

  const typename = b.slice(0, i).toString('ascii');
  const key = b.slice(i);
  return [typename, key];
}

exports.fromId = fromId;

/**
 * Encodes a typename and key into a global ID
 *
 * @param {string} typename GraphQL typename
 * @param {string | Buffer} key Type-specific identifier
 * @returns {string} Base64 encoded Node ID
 */
function toId(typename, key) {
  const prefix = Buffer.from(typename + DIVIDER_TOKEN, 'ascii');
  const keyEncoded = typeof key === 'string' ? Buffer.from(key, 'ascii') : key;

  return Buffer.concat(
    [prefix, keyEncoded],
    prefix.length + keyEncoded.length,
  ).toString('base64');
}

exports.toId = toId;
