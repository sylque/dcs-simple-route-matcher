Package.describe({
  name: 'sylque:dcs-simple-route-matcher',
  version: '0.0.4',
  // Brief, one-line summary of the package.
  summary:
    'A Meteor package to match an application route with a Docuss page name',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/sylque/dcs-simple-route-matcher',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Package.onUse(function(api) {
  api.versionsFrom('1.6.1')
  api.use('ecmascript')
  api.mainModule('lib/main-client.js', 'client')
  api.mainModule('lib/main-server.js', 'server')
})
