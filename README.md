# Apollo Federation and Relay conventions

> [!IMPORTANT]
> **This repository is archived and no longer maintained.**
>
> It was a demo of exposing Relay's global `node(id:)` field across an
> Apollo Federation supergraph, by generating a Node resolution service inside
> a customized `@apollo/gateway`. It still works (dependencies were updated
> one last time before archiving), but I don't recommend building on it:
>
> - **It depends on gateway internals.** `NodeGateway` and `NodeCompose`
>   subclass undocumented parts of `@apollo/gateway`. Apollo's focus is now
>   the [Apollo Router], where this approach doesn't apply.
> - **Federation has native building blocks now.** Since Federation 2.3,
>   [entity interfaces] (`@key` on interfaces and `@interfaceObject`) let a
>   subgraph contribute fields to, and return, any implementation of an
>   interface like `Node` without knowing the concrete types. A root
>   `node(id:)` field still needs a subgraph that maps IDs to types, but that
>   can be an ordinary subgraph instead of gateway magic.
> - **Relay itself is alive and well** (see [Relay 21]), and the
>   [Relay Global Object Identification] and [Relay Cursor Connections] specs
>   are still good conventions. They just don't need this repo.
>
> The code is left here as a reference.

> Combining Apollo Federation with Relay server specifications

## Support

- [x] [Relay Global Object Identification]
- [x] [Relay Cursor Connections]

[Relay Input Object Mutations] are no longer a required part of Relay,
and the linked specification appears to have been removed.
It was never affected by Apollo Federation.

## Quick start

```shell
npm install
npm run start
```

Then you can query for products from the global `node` interface:

```graphql
query {
  node(id: "UHJvZHVjdDox") {
    id
    ... on Product {
      name
    }
  }
}
```

You can also query for reviews, which can review any node supported by the review service:

```graphql
query {
  reviews {
    id
    body
    rating
    node {
      __typename
      id
      ... on Product {
        name
        reviews {
          edges {
            node {
              rating
            }
          }
        }
      }
    }
  }
}
```

## TODO

- [x] Automatically generate schema for Node resolution service in gateway
- [x] Run Node resolution service locally in gateway
- [x] Support `query { node }` in each service

[Relay Global Object Identification]: https://relay.dev/graphql/objectidentification.htm
[Relay Cursor Connections]: https://relay.dev/graphql/connections.htm
[Relay Input Object Mutations]: https://relay.dev/graphql/mutations.htm
[Apollo Router]: https://www.apollographql.com/docs/graphos/routing
[entity interfaces]: https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/entities/interfaces
[Relay 21]: https://relay.dev/blog/2026/05/18/relay-21/
