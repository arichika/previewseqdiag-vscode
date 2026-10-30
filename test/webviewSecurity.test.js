const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const vm = require('node:vm');

const settings = {};
const vscodeMock = {
  Uri: { file: (fileName) => fileName },
  workspace: {
    getConfiguration: () => ({ get: (key) => settings[key] }),
  },
};

// The extension host provides vscode at runtime; these tests exercise the real
// HTML generators without requiring a running VS Code instance.
const originalLoad = Module._load;
let MermaidCodeSnippet;
let MscgenCodeSnippet;
let Misc;
try {
  Module._load = function(request, parent, isMain) {
    return request === 'vscode'
      ? vscodeMock
      : originalLoad.call(this, request, parent, isMain);
  };
  ({ MermaidCodeSnippet } = require('../out/mermaidCodeSnippet.js'));
  ({ MscgenCodeSnippet } = require('../out/mscgenCodeSnippet.js'));
  ({ Misc } = require('../out/misc.js'));
} finally {
  Module._load = originalLoad;
}

const {
  getDownloadBaseName,
  serializeForInlineScript,
} = require('../out/previewLogic.js');

const webview = {
  cspSource: 'https://webview.example.test',
  asWebviewUri: () => 'https://webview.example.test/mermaid.min.js',
};

function scriptsIn(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .map((match) => ({ attributes: match[1], source: match[2], offset: match.index }));
}

async function runPreviewScripts(html) {
  const container = { textContent: '', style: {} };
  const calls = [];
  const context = vm.createContext({
    document: {
      getElementById: () => container,
      querySelector: () => container,
    },
    mermaid: {
      initialize: (config) => calls.push({ method: 'initialize', config }),
      run: (options) => {
        calls.push({ method: 'run', options, text: container.textContent });
        return Promise.resolve();
      },
    },
    console,
  });
  for (const script of scriptsIn(html)) {
    if (!/\bsrc\s*=/.test(script.attributes)) {
      await vm.runInContext(script.source, context);
    }
  }
  return { container, calls, context };
}

async function createMermaidHtml(source, backgroundColor = '#ffffff') {
  settings['mermaid.fixedStyle'] = 'forest';
  settings['mermaid.fixedBackgroundColor'] = backgroundColor;
  return MermaidCodeSnippet.instance.createCodeSnippet({
    document: {
      fileName: 'C:\\workspace\\diagram.mmd',
      uri: { fsPath: 'C:\\workspace\\diagram.mmd' },
      getText: () => source,
    },
    extensionPath: 'C:\\extension',
    webview,
  });
}

test('inline script data cannot terminate its script and roundtrips exactly', () => {
  const value = {
    text: '</ScRiPt><img src=x onerror="globalThis.__injected=true"> & \u2028\u2029',
    quoted: '"\\\n\r',
  };
  const serialized = serializeForInlineScript(value);
  assert.doesNotMatch(serialized, /[<>&\u2028\u2029]/);
  assert.deepEqual(JSON.parse(serialized), value);
});

test('Mermaid receives literal diagram text after its classic bundle loads', async () => {
  const source = 'sequenceDiagram\nAlice->>Bob: A & B <br/> C < D';
  const html = await createMermaidHtml(source);
  const scripts = scriptsIn(html);
  const bundle = scripts.find((script) => /\bsrc\s*=/.test(script.attributes));
  const initialization = scripts.find((script) => /mermaid\.initialize/.test(script.source));
  assert.ok(bundle, 'the browser bundle must be included');
  assert.ok(initialization, 'the renderer must be initialized');
  assert.ok(bundle.offset < initialization.offset, 'initialization must follow bundle loading');
  assert.doesNotMatch(bundle.attributes, /\btype\s*=\s*["']module["']/i);

  const { container, calls } = await runPreviewScripts(html);
  assert.equal(container.textContent, source);
  assert.equal(container.style.backgroundColor, '#ffffff');
  assert.deepEqual(calls.map((call) => call.method), ['initialize', 'run']);
  assert.equal(calls[0].config.securityLevel, 'strict');
  assert.equal(calls[0].config.startOnLoad, false);
  assert.equal(calls[0].config.theme, 'forest');
  assert.equal(calls[1].text, source);
});

test('hostile Mermaid text and background settings stay data rather than markup or code', async () => {
  const source = 'sequenceDiagram\nAlice->>Bob: </script><script>globalThis.__injected=true</script>'
    + '</div><img src=x onerror="globalThis.__injected=true"> & \u2028\u2029';
  const background = 'red"><img src=x onerror="globalThis.__injected=true">';
  const html = await createMermaidHtml(source, background);
  assert.doesNotMatch(html, /<img\b/i);
  assert.doesNotMatch(html, /<script>globalThis\.__injected/i);

  const { container, context } = await runPreviewScripts(html);
  assert.equal(container.textContent, source);
  assert.equal(container.style.backgroundColor, background);
  assert.equal(context.__injected, undefined);
});

test('download filenames containing JavaScript syntax remain literal filenames', () => {
  const sourceFileName = 'C:\\workspace\\diagram";globalThis.__injected=true;var ignored=".mmd';
  const html = Misc.getFormattedHtml('', '', webview, sourceFileName);
  const downloads = [];
  const context = vm.createContext({
    document: {
      querySelector: () => ({}),
      createElement: () => ({
        setAttribute: (name, value) => {
          if (name === 'download') downloads.push(value);
        },
        dispatchEvent: () => {},
      }),
    },
    XMLSerializer: class {
      serializeToString() { return '<svg xmlns="http://www.w3.org/2000/svg"/>'; }
    },
    MouseEvent: class {},
  });
  for (const script of scriptsIn(html)) {
    if (!/\bsrc\s*=/.test(script.attributes)) vm.runInContext(script.source, context);
  }
  context.SaveImageAs('svg', 0, false);
  assert.equal(context.__injected, undefined);
  assert.deepEqual(downloads, [getDownloadBaseName(sourceFileName) + '.svg']);
});

test('Mscgen source cannot break out of its inert script element', async () => {
  const source = 'msc { a,b; a->b [label="</script><script>globalThis.__injected=true</script>'
    + '<img src=x onerror=globalThis.__injected=true>"]; }';
  const html = await MscgenCodeSnippet.instance.createCodeSnippet({
    document: {
      languageId: 'mscgen',
      fileName: 'C:\\workspace\\diagram.msc',
      getText: () => source,
    },
    extensionPath: 'C:\\extension',
    webview,
  });
  assert.doesNotMatch(html, /<img\b/i);
  assert.doesNotMatch(html, /<script>globalThis\.__injected/i);
  const scripts = scriptsIn(html);
  const dataScript = scripts.find((script) => /\btype\s*=\s*["']text\/x-mscgen["']/i.test(script.attributes));
  assert.ok(dataScript, 'the renderer must receive its expected data script type');
  assert.equal(dataScript.source.trim(), '', 'source must be assigned after HTML parsing');
  const bundle = scripts.find((script) => /\bsrc\s*=/.test(script.attributes));
  assert.match(bundle.attributes, /\bdefer\b/i);

  const container = { textContent: '' };
  const context = vm.createContext({ document: { getElementById: () => container } });
  for (const script of scripts) {
    if (!/\bsrc\s*=/.test(script.attributes) && !/\btype\s*=\s*["']text\/x-/i.test(script.attributes)) {
      vm.runInContext(script.source, context);
    }
  }
  assert.equal(container.textContent, source);
  assert.equal(context.__injected, undefined);
});
