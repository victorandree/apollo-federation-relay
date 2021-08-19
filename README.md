# Apollo Federation and Relay conventions

> Combining Apollo Federation with Relay server specifications

## Compatibility warning

> With `@apollo/gateway@0.34.0`, Apollo has changed how it manages federated schemas.
> This project has not been updated to handle these changes.
>
> PRs are welcome to support `@apollo/gateway >= 0.34.0`.

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
