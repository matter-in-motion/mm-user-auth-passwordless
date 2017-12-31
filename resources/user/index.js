'use strict';
const api = require('./api');
const Passwordless = require('./passwordless');

module.exports = () => ({ api, passwordless: new Passwordless() });
