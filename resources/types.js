'use strict';

const token = () => ({
  type: 'string',
  pattern: '^[A-Za-z0-9-_]+.[A-Za-z0-9-_]+.[A-Za-z0-9-_]*$'
});

module.exports = { token };
