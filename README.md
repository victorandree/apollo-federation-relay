# Apollo Federation and Relay conventions

> Combining Apollo Federation with Relay server specifications

## Support

- [x] [Relay Global Object Identification]: Only at the gateway level. Having `node` root fields in each service would collide upon gatewayification (also see TODO)
- [x] [Relay Input Object Mutations]: Not affected by Federation
- [ ] [Relay Cursor Connections]: Not supported until Apollo Federation supports value types (because of `PageInfo`)

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
          rating
        }
      }
    }
  }
}
```

## TODO

- [ ] Automatically generate schema for Node resolution service in gateway
- [ ] Run Node resolution service locally in gateway

[Relay Global Object Identification]: https://relay.dev/graphql/objectidentification.htm
[Relay Cursor Connections]: https://relay.dev/graphql/connections.htm
[Relay Input Object Mutations]: https://relay.dev/graphql/mutations.htm