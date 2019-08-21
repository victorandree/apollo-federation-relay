const {
  ApolloGateway,
  RemoteGraphQLDataSource,
  LocalGraphQLDataSource,
} = require('@apollo/gateway');
const { gql } = require('apollo-server');
const { parse, visit, graphqlSync } = require('graphql');
const { buildFederatedSchema } = require('@apollo/federation');
const GraphQLNode = require('./graphql-node');

const NODE_SERVICE_NAME = 'NODE_SERVICE';

const isNode = node =>
  node.interfaces.some(({ name }) => name.value === 'Node');

const toTypeDefs = name =>
  gql`
    extend type ${name} implements Node @key(fields: "id") {
      id: ID! @external
    }
  `;

const RootModule = {
  typeDefs: gql`
    type Query {
      node(id: ID!): Node
    }
  `,
  resolvers: {
    Query: {
      node(_, { id }) {
        return { id };
      },
    },
  },
};

/**
 * An ApolloGateway which provides `Node` resolution across all federated
 * services, and a global `node` field, like Relay.
 */
class NodeGateway extends ApolloGateway {
  async loadServiceDefinitions(config) {
    const defs = await super.loadServiceDefinitions(config);

    // Once all real service definitions have been loaded, we need to iterate
    // over them to find the set of types that implement the `Node` interface
    const seenNodeTypes = new Set();
    let modules = [];
    for (const service of defs.serviceDefinitions) {
      visit(service.typeDefs, {
        ObjectTypeDefinition(node) {
          const name = node.name.value;
          if (!isNode(node) || seenNodeTypes.has(name)) {
            return;
          }

          modules.push({ typeDefs: toTypeDefs(name) });
        },
      });
    }

    if (!modules.length) {
      return defs;
    }

    // Dynamically create, introspect and add a sync Node resolution service
    const nodeSchema = buildFederatedSchema([
      GraphQLNode,
      RootModule,
      ...modules,
    ]);

    const res = graphqlSync({
      schema: nodeSchema,
      source: 'query { _service { sdl } }',
    });

    defs.serviceDefinitions.push({
      typeDefs: parse(res.data._service.sdl),
      schema: nodeSchema,
      name: NODE_SERVICE_NAME,
    });

    return defs;
  }

  // We override this function to get around a hard check for `services[].url`,
  // otherwise we could've just provided `buildService`
  createServices(services) {
    for (const serviceDef of services) {
      if (serviceDef.schema) {
        this.serviceMap[serviceDef.name] = new LocalGraphQLDataSource(
          serviceDef.schema,
        );

        continue;
      }

      if (!serviceDef.url) {
        throw new Error(
          `Service definition for service ${serviceDef.name} is missing a url`,
        );
      }

      this.serviceMap[serviceDef.name] = this.config.buildService
        ? this.config.buildService(serviceDef)
        : new RemoteGraphQLDataSource({
            url: serviceDef.url,
          });
    }
  }
}

exports.NodeGateway = NodeGateway;
