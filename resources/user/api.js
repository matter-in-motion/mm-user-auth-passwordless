'use strict';
const errors = require('mm-errors');
const types = require('../types');

module.exports = {
  __extend: true,

  authenticate: function(app) {
    const ctrl = app.units.require('resources.user.passwordless');

    return {
      auth: false,
      title: 'User',
      description: 'Authenticate user with token',
      request: types.token(),
      response: {
        expires: {
          type: 'number',
          minimum: 0
        },
        token: types.token(),
        redirect: {
          type: 'string',
          format: 'uri'
        }
      },

      call: (auth, data) => ctrl
        .authenticate(data)
        .catch(errors.ifError('Unauthorized'))
    };
  },

  sendAuthentication: function(app) {
    const ctrl = app.units.require('resources.user.passwordless');

    return {
      auth: false,
      title: 'User',
      description: 'Send authenticate token to user\'s email',
      request: {
        type: 'object',
        required: [ 'email' ],
        additionalProperties: false,
        properties: {
          email: {
            type: 'string',
            format: 'email'
          },
          data: {
            type: 'object',
            additionalProperties: false,
            properties: {
              redirect: {
                type: 'string',
                format: 'uri' //using uri because url doesn't allow localhost
              }
            }
          }
        }
      },

      response: {
        const: true
      },

      call: (auth, data) => ctrl
        .sendAuthentication(data.email, data.data)
        .catch(errors.ifError('NotFound'))
    };
  }
}
