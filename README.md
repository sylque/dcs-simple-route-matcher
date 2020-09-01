# dcs-simple-route-matcher

A Meteor package to match an application route with a
[Docuss](https://github.com/sylque/docuss) page name.

The application route is identified by the pathname of its url.

**This project is not active anymore.** Fixes are provided to existing users, but I stopped working on new features. You might want to check  [DiscPage](https://github.com/sylque/discpage), which is somehow a simplified version of Docuss.

## Installation

```
meteor add sylque:dcs-simple-route-matcher
```

## How it works

The scheme is very basic and might not be suitable for a large scale app:
pathname/pageName pairs are stored in a collection which is entirely published
to all users.

Page names are of the form `[prefix][id]`, where `id` is a base-36 counter.

## How to use

```javascript
import { SimpleRouteMatcher } from 'meteor/sylque:dcs-simple-route-matcher'

const routeMatcher = new SimpleRouteMatcher({
  // Max length of page names. This is used to check predefined and generated
  // page names.
  maxPageNameLength: 6,

  // Set this if page names are lowercase. This is used to check predefined
  // and generated page names.
  forceLowercase: true,

  // Predefined page names and their associated pathnames (optional)
  predefinedPageNames: [
    { pageName: 'home', pathname: '/'},
    { pageName: 'contac', pathname: '/contact'},
    { pageName: 'faq', pathname: '/faq'}
  ],

  // Prefix for generated page names (optional)
  otherPagesPrefix: 'o_'
})

routeMatcher.getPageName('/contact') // => "contac"
routeMatcher.getPageName('/qwerty')  // => "o_1"

routeMatcher.getPathname('faq')      // => "/faq"
routeMatcher.getPathname('o_1')      // => "/qwerty"
routeMatcher.getPathname('hello')    // => null
```

## License

See [here](https://github.com/sylque/docuss#license).
