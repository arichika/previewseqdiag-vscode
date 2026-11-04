'use strict';

const upstream = require('minimatch-core');

// Older ESLint config packages expect a callable default export. Matching and
// the Minimatch class still come entirely from the patched upstream package.
function minimatch(path, pattern, options) {
  return upstream.minimatch(path, pattern, options);
}

module.exports = Object.assign(minimatch, upstream);
