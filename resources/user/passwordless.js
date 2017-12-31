'use strict';
const Passwordless = function() {};

Passwordless.prototype.__init = function(units) {
  this.auth = units.require('core.auth').provider('user');

  if (!this.auth) {
    throw Error('No user auth provider found');
  }

  this.mail = units.require('mail.controller');
  this.user = units.require('user.controller');

  this.settings = this.user.settings;
};

Passwordless.prototype.getUser = function(opts) {
  return this.user
    .__get(opts)
    .pluck('id', 'email')
    .run()
    .catch(this.user.notFound);
};

Passwordless.prototype.authenticate = function(token) {
  return this
    .login(token)
    .then(data => this.auth.sign({ id: data.id }, { mixin: data.data }))
};

Passwordless.prototype.login = function(token) {
  return this.auth
    .verify(token, { audience: 'login' })
    .then(token => this
      .getUser({ id: token.id })
      .then(user => ({
        id: user.id,
        data: token.data
      }))
    )
};

Passwordless.prototype.getLoginToken = function(email, data) {
  return this
    .getUser({ email })
    .then(user => {
      const token = { id: user.id };
      if (data) {
        token.data = data;
      }

      return this.auth.sign(token, {
        audience: 'login',
        expiresIn: this.settings.login.expiresIn || '15 minutes'
      });
    });
};

Passwordless.prototype.sendAuthentication = function(email, redirect) {
  return this
    .getLoginToken(email, redirect)
    .then(token => this.sendEmail('login', { email, token }))
    .then(() => true);
};

Passwordless.prototype.sendEmail = function(type, data, opts = {}) {
  const s = this.settings;
  const mail = Object.assign({}, s.mail, s[type], opts, {
    to: data.email,
    data: data
  });

  return this.mail.send(mail);
};

module.exports = Passwordless;
