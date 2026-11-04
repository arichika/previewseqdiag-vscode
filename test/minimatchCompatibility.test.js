const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const { ESLint } = require('eslint');

const root = path.resolve(__dirname, '..');
const absolute = (file) => path.resolve(root, file);
const relative = (file) => path.relative(root, file).split(path.sep).join('/');

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(file)
      : entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts') ? [relative(file)] : [];
  });
}

test('ESLint keeps TypeScript inclusion and declaration/generated-file ignores', async () => {
  const eslint = new ESLint({ cwd: root });
  for (const file of ['src/extension.ts', 'src/nested/example.ts', 'src/.hidden/example.ts']) {
    assert.equal(await eslint.isPathIgnored(absolute(file)), false, file);
    const config = await eslint.calculateConfigForFile(absolute(file));
    assert.equal(config.languageOptions.parser.meta.name, 'typescript-eslint/parser', file);
    assert.equal(config.rules.curly[0], 1, file);
  }
  for (const file of [
    'src/types.d.ts', 'src/nested/types.d.ts', 'dist/extension.js',
    'node_modules/example/file.js', 'test/example.ts',
  ]) {
    assert.equal(await eslint.isPathIgnored(absolute(file)), true, file);
  }
});

test('ESLint glob traversal selects every source file with supported path separators', async () => {
  const eslint = new ESLint({ cwd: root });
  const expected = sourceFiles(absolute('src')).sort();
  assert.ok(expected.length > 0);
  const patterns = ['src/**/*.ts'];
  if (process.platform === 'win32') patterns.push('src\\**\\*.ts');
  for (const pattern of patterns) {
    const results = await eslint.lintFiles([pattern]);
    assert.deepEqual(results.map((result) => relative(result.filePath)).sort(), expected, pattern);
    assert.equal(results.reduce((total, result) => total + result.errorCount, 0), 0, pattern);
  }
});

test('CommonJS and ESM config-array consumers preserve glob and ignore semantics', async () => {
  const consumers = [require('@eslint/config-array'), await import('@eslint/config-array')];
  for (const { ConfigArray } of consumers) {
    const configs = new ConfigArray([
      { ignores: ['**/*.d.ts', 'dist/**', 'node_modules/**'] },
      { files: ['src/**/*.ts'] },
    ], { basePath: root });
    await configs.normalize();
    for (const file of ['src/example.ts', 'src/nested/example.ts', 'src/.hidden/example.ts']) {
      assert.equal(configs.getConfigStatus(absolute(file)), 'matched', file);
    }
    for (const file of ['src/example.d.ts', 'src/nested/example.d.ts', 'dist/example.js', 'node_modules/example/index.js']) {
      assert.equal(configs.getConfigStatus(absolute(file)), 'ignored', file);
    }
    assert.equal(configs.getConfigStatus(absolute('test/example.ts')), 'unconfigured');
  }
});

test('CommonJS and ESM FlatCompat preserve legacy basename and exclusion matching', async () => {
  const consumers = [require('@eslint/eslintrc'), await import('@eslint/eslintrc')];
  const base = absolute('src');
  for (const { FlatCompat } of consumers) {
    const compat = new FlatCompat({ baseDirectory: base });
    const configs = compat.config({
      overrides: [{
        files: ['*.{ts,tsx}'], excludedFiles: ['*.d.ts'], rules: { eqeqeq: 'error' },
      }],
    });
    const override = configs.find((config) => config.rules && config.rules.eqeqeq);
    assert.ok(override);
    const matches = override.files[0];
    for (const file of ['one.ts', 'nested/two.tsx', '.hidden/three.ts']) {
      assert.equal(matches(path.join(base, file)), true, file);
    }
    for (const file of ['one.d.ts', 'nested/two.d.ts', 'one.js']) {
      assert.equal(matches(path.join(base, file)), false, file);
    }
  }
});

test('consumer-owned minimatch supports legacy calls, named exports and partial directory matching', async () => {
  const eslintRequire = createRequire(require.resolve('eslint'));
  const legacy = eslintRequire('minimatch');
  const modern = await import('minimatch');
  assert.equal(typeof legacy, 'function');
  assert.equal(typeof modern.default, 'function');
  for (const match of [legacy, legacy.minimatch, modern.default, modern.minimatch]) {
    assert.equal(match('src/nested/file.ts', 'src/**/*.{ts,tsx}'), true);
    assert.equal(match('src/nested/file.js', 'src/**/*.{ts,tsx}'), false);
  }
  for (const { Minimatch } of [legacy, modern]) {
    const matcher = new Minimatch('src/**/*.ts', { dot: true });
    assert.equal(matcher.match('src/nested', true), true);
    assert.equal(matcher.match('src/nested'), false);
    assert.equal(matcher.match('other/nested', true), false);
    assert.equal(matcher.match('src/.hidden/file.ts'), true);
  }
});

test('complex glob preprocessing is bounded in the matcher actually used by ESLint', { timeout: 10000 }, () => {
  // Upstream security regressions for GHSA-g3hv-75wg-m249:
  // https://github.com/isaacs/minimatch/blob/v11.0.4/test/preprocess-limits.ts
  // A child process makes a regression unable to hang the whole test runner.
  const result = spawnSync(process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const { createRequire } = require('node:module');
    const consumerRequire = createRequire(require.resolve('eslint'));
    const { Minimatch } = consumerRequire('minimatch');
    const bounded = new Minimatch(Array(30).fill('**/../a/b').join('/'), {
      optimizationLevel: 2, braceExpandMax: 64,
    });
    assert.equal(bounded.set.length, 64);
    const short = new Minimatch('**/../a/b/**/../c/d', { optimizationLevel: 2 });
    assert.equal(short.match('../a/b/../c/d'), true);
    assert.equal(short.match('x/a/b/y/c/d'), true);
    const braces = new Minimatch('{x,*}/{0..999}');
    assert.equal(braces.match('x/5'), true);
    assert.equal(braces.match('y/999'), true);
    assert.equal(braces.match('.y/5'), false);
    process.stdout.write('bounded glob preprocessing passed');
  `], { cwd: root, encoding: 'utf8', timeout: 5000, windowsHide: true });
  assert.equal(result.error, undefined, result.error && result.error.message);
  assert.equal(result.signal, null, result.stderr);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.stdout, 'bounded glob preprocessing passed');
});
