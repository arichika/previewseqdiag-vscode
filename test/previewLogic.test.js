const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getDownloadBaseName,
  getSnippetKind,
  isPreviewableLanguage,
  resolveMermaidImports,
  resolveMermaidPreviewConfig,
  resolveMscgenPreviewConfig,
} = require('../out/previewLogic.js');

test('isPreviewableLanguage returns true only for supported languages', () => {
  assert.equal(isPreviewableLanguage('mermaid'), true);
  assert.equal(isPreviewableLanguage('mmd'), true);
  assert.equal(isPreviewableLanguage('mscgen'), true);
  assert.equal(isPreviewableLanguage('plaintext'), false);
});

test('getSnippetKind maps language ids to renderer families', () => {
  assert.equal(getSnippetKind('mermaid'), 'mermaid');
  assert.equal(getSnippetKind('mmd'), 'mermaid');
  assert.equal(getSnippetKind('msgenny'), 'mscgen');
  assert.equal(getSnippetKind('xu'), 'mscgen');
  assert.equal(getSnippetKind('plaintext'), 'default');
});

test('resolveMermaidPreviewConfig falls back for invalid values', () => {
  assert.deepEqual(
    resolveMermaidPreviewConfig('neutral', '#ffffff', '#fafaf6'),
    {
      fixedStyle: 'neutral',
      fixedBackgroundColor: '#ffffff',
    },
  );

  assert.deepEqual(
    resolveMermaidPreviewConfig('invalid-theme', undefined, '#fafaf6'),
    {
      fixedStyle: 'forest',
      fixedBackgroundColor: '#fafaf6',
    },
  );
});

test('resolveMscgenPreviewConfig falls back for invalid values', () => {
  assert.deepEqual(
    resolveMscgenPreviewConfig('lazy', 'fixed'),
    {
      fixedNamedStyle: 'lazy',
      horizontalAlignment: 'fixed',
    },
  );

  assert.deepEqual(
    resolveMscgenPreviewConfig('invalid-style', 'invalid-alignment'),
    {
      fixedNamedStyle: 'cygne',
      horizontalAlignment: 'stretch',
    },
  );
});

test('resolveMermaidImports inlines referenced files and strips sequenceDiagram markers', () => {
  const readCalls = [];
  const source = [
    'sequenceDiagram',
    'Alice->>Bob: hello',
    '%% import: part.mmd',
  ].join('\n');

  const result = resolveMermaidImports(
    source,
    'C:/workspace/sample/main.mmd',
    (fileName) => {
      readCalls.push(fileName);
      return [
        'sequenceDiagram',
        'Bob->>Carol: imported',
      ].join('\n');
    },
  );

  assert.deepEqual(readCalls, ['C:\\workspace\\sample\\part.mmd']);
  assert.equal(result.includes('Bob->>Carol: imported'), true);
  assert.equal(result.includes('sequenceDiagram\nBob->>Carol: imported'), false);
});

test('getDownloadBaseName extracts the file name without extension', () => {
  assert.equal(getDownloadBaseName('C:/workspace/sample.mmd'), 'sample');
  assert.equal(getDownloadBaseName('C:\\workspace\\nested\\sample.mermaid'), 'sample');
  assert.equal(getDownloadBaseName(undefined), 'PreviewSeqDiagImage');
});
