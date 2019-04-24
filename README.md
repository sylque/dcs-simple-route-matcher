# dcs-simple-route-matcher

A Meteor package to match an application route with a
[Docuss](https://github.com/sylque/docuss) page name.

The application route is identified by the pathname of its url

## Installation

```
meteor add sylque:dcs-simple-route-matcher
```

## How it works

The scheme is very basic and might not be suitable for a large scale app:
pathname/pageName pairs are stored in a collection which is entirely published
to users.

Page names are of the form `[prefix][id]`, where `id` is a base-36 counter.

## License

See [here](https://github.com/sylque/docuss#license).
