'use strict';

// had enabled by egg
// exports.static = true;
exports.onerror = false;

exports.validate = {
  enable: true,
  package: 'egg-validate',
};

exports.mongoose = {
  enable: true,
  package: 'egg-mongoose',
};

exports.cors = {
  enable: true,
  package: 'egg-cors',
};
