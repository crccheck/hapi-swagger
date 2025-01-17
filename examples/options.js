// `options.js` - how to use many of the plug-in options

'use strict';

const BearerToken = require('hapi-auth-bearer-token');
const Blipp = require('blipp');
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');

const HapiSwagger = require('../');
const Pack = require('../package');
const Routes = require('./assets/routes-complex.js');

/*
const goodOptions = {
    ops: {
        interval: 1000
    },
    reporters: {
        console: [
            {
                module: '@hapi/good-squeeze',
                name: 'Squeeze',
                args: [
                    {
                        log: '*',
                        response: '*'
                    }
                ]
            },
            {
                module: 'good-console'
            },
            'stdout'
        ]
    }
};
*/

const swaggerOptions = {
  basePath: '/v1',
  pathPrefixSize: 2,
  info: {
    title: 'Test API Documentation',
    description: 'This is a sample example of API documentation.',
    version: Pack.version,
    termsOfService: 'https://github.com/glennjones/hapi-swagger/',
    contact: {
      email: 'glennjonesnet@gmail.com'
    },
    license: {
      name: 'MIT',
      url: 'https://raw.githubusercontent.com/glennjones/hapi-swagger/master/license.txt'
    }
  },
  tags: [
    {
      name: 'sum',
      description: 'working with maths',
      externalDocs: {
        description: 'Find out more',
        url: 'http://example.org'
      }
    },
    {
      name: 'store',
      description: 'storing data',
      externalDocs: {
        description: 'Find out more',
        url: 'http://example.org'
      }
    },
    {
      name: 'properties',
      description: 'test the use of extended hapi/joi properties',
      externalDocs: {
        description: 'Find out more',
        url: 'http://example.org'
      }
    }
  ],
  securityDefinitions: {
    Bearer: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      'x-keyPrefix': 'Bearer '
    }
  },
  security: [{ Bearer: [] }],
  deReference: false,
  cache: {
    expiresIn: 24 * 60 * 60 * 1000
  }
};

const ser = async () => {
  const server = Hapi.Server({
    host: 'localhost',
    port: 3000
  });

  await server.register(BearerToken);
  server.auth.strategy('bearer', 'bearer-access-token', {
    accessTokenName: 'access_token',
    validate: (request, token) => {
      const isValid = token === '12345';

      if (isValid) {
        const credentials = { token };
        const artifacts = {
          user: {
            username: 'glennjones',
            name: 'Glenn Jones',
            groups: ['admin', 'user']
          }
        };
        return { isValid, credentials, artifacts };
      }
    }
  });

  // Blipp and Good - Needs updating for Hapi v17.x
  await server.register([
    Inert,
    Vision,
    Blipp,
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  ]);

  server.route(Routes);

  server.views({
    path: 'examples/assets',
    engines: { html: require('handlebars') },
    isCached: false
  });

  await server.start();

  return server;
};

ser()
  .then((server) => {
    console.log(`Server listening on ${server.info.uri}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
