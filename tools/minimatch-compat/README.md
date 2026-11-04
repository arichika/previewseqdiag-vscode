# minimatch export compatibility

This private development dependency forwards all matching to the audited npm
package `minimatch@11.0.4`, installed under the alias `minimatch-core`.

The root override routes the ESLint and TypeScript ESLint dependency paths here.
The CommonJS and ESM entries retain the callable default export expected by older
ESLint config packages while also exposing minimatch v11's named API. No legacy
matching implementation or vulnerability suppression is included.

This package is excluded from the VSIX. Remove it and the root override once all
lint dependencies support patched minimatch versions and their current exports.
