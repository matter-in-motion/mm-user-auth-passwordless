'use strict';
const fs = require('fs');
const test = require('ava');
const nodemailer = require('nodemailer');
const extension = require('./index');
const createApp = require('mm-test').createApp;
process.env.NODE_ENV = 'production'

const rxUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let app;
let user;
let ctrl;

test.before(() => nodemailer
  .createTestAccount()
  .then(account => {
    app = createApp({
      extensions: [
        'http',
        'user',
        'mail',
        'nunjucks',
        'rethinkdb',
        'rethinkdb-unique',
        'rethinkdb-schema',
        'db-schema',
        extension
      ],

      auth: {
        user: {
          active: true,
          token: {
            key: 'lalala my super secret key',
            algorithm: 'HS256',
            expiresIn: '28 days',
            subject: 'user',
            audience: 'auth',
            issuer: 'test' //token recipient put your app url here
          }
        }
      },

      rethinkdb: {
        db: 'test',
        silent: true
      },

      http: {
        port: 3000,
        host: '0.0.0.0'
      },

      user: {
        login: {
          expiresIn: '5 mins',
          template: 'login.html'
        }
      },

      nunjucks: {
        path: './'
      },

      mail: {
        templates: 'nunjucks',
        transport: {
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass
          }
        }
      }
    })

    user = app.units.require('resources.user.controller');
    ctrl = app.units.require('resources.user.passwordless');
    return app.run('db', 'updateSchema');
  })
  .then(() => new Promise((resolve, reject) => {
    fs.writeFile('login.html', `
      <!DOCTYPE html>
      <html lang="en">
      <body>
        {{ token.expires }}
        {{ token.token }}
      </body>
      </html>
    `, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      })
  }))
);

test.after.always(() => app.run('db', 'dropSchema')
  .then(() => new Promise((resolve, reject) => {
    fs.unlink('login.html', err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  }))
);

let uid;
test.serial('creates a user', t => user
  .create({
    email: 'test@test.com',
    name: 'test name'
  })
  .then(id => {
    uid = id;
    t.regex(id, rxUUID)
  })
);

test.serial('gets a login token and autheticate user', t => ctrl
  .getLoginToken('test@test.com')
  .then(token => {
    t.truthy(token.token);
    t.truthy(token.expires);
    return ctrl.login(token.token);
  })
  .then(data => {
    t.is(data.id, uid);
    t.is(data.redirect, undefined);
  })
);

test.serial('gets a login token and autheticate user', t => ctrl
  .getLoginToken('test@test.com', { redirect: 'something' })
  .then(token => {
    t.truthy(token.token);
    t.truthy(token.expires);
    t.is(token.redirect, undefined);
    return ctrl.authenticate(token.token);
  })
  .then(token => {
    t.truthy(token.token);
    t.truthy(token.expires);
    t.is(token.redirect, 'something');
  })
);

test.serial('sends login email', t => ctrl
  .sendAuthentication('test@test.com')
  .then(res => t.is(res, true))
);

test.serial('fails to send login email to uknown user', t => ctrl
  .sendAuthentication('unknown@test.com')
  .then(() => t.fail())
  .catch(err => t.is(err.code, 4540))
);
