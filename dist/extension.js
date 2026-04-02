/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PreviewSeqDiagPanel = void 0;
const vscode = __webpack_require__(1);
const defaultCodeSnippet_1 = __webpack_require__(4);
const mermaidCodeSnippet_1 = __webpack_require__(7);
const mscgenCodeSnippet_1 = __webpack_require__(9);
const previewLogic_1 = __webpack_require__(6);
class PreviewSeqDiagPanel {
    constructor() {
        this.webViewPanel = null;
        this.extensionPath = '';
    }
    setCurrentWebViewPanel(panel) {
        this.webViewPanel = panel;
    }
    setExtensionPath(path) {
        this.extensionPath = path;
    }
    canPreview(editor = vscode.window.activeTextEditor) {
        return !!editor && (0, previewLogic_1.isPreviewableLanguage)(editor.document.languageId);
    }
    update() {
        return __awaiter(this, arguments, void 0, function* (editor = vscode.window.activeTextEditor) {
            if (!this.webViewPanel || !this.canPreview(editor)) {
                return;
            }
            const snippet = this.getSnippet(editor.document.languageId);
            const context = {
                document: editor.document,
                extensionPath: this.extensionPath,
                webview: this.webViewPanel.webview,
            };
            const html = yield snippet.createCodeSnippet(context);
            if (this.webViewPanel) {
                this.webViewPanel.webview.html = html;
            }
        });
    }
    getSnippet(languageId) {
        switch ((0, previewLogic_1.getSnippetKind)(languageId)) {
            case 'mermaid':
                return mermaidCodeSnippet_1.MermaidCodeSnippet.instance;
            case 'mscgen':
                return mscgenCodeSnippet_1.MscgenCodeSnippet.instance;
            default:
                return defaultCodeSnippet_1.DefaultCodeSnippet.instance;
        }
    }
}
exports.PreviewSeqDiagPanel = PreviewSeqDiagPanel;


/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultCodeSnippet = void 0;
const misc_1 = __webpack_require__(5);
class DefaultCodeSnippet {
    constructor() { }
    static get instance() {
        if (!this._instance) {
            this._instance = new DefaultCodeSnippet();
        }
        return this._instance;
    }
    createCodeSnippet(context) {
        return __awaiter(this, void 0, void 0, function* () {
            return misc_1.Misc.getFormattedHtml('', context.document.getText(), context.webview, context.document.fileName);
        });
    }
}
exports.DefaultCodeSnippet = DefaultCodeSnippet;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Misc = void 0;
const previewLogic_1 = __webpack_require__(6);
class Misc {
    static getFormattedHtml(head, body, webview, sourceFileName) {
        const fileName = (0, previewLogic_1.getDownloadBaseName)(sourceFileName);
        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">`
            + `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob: ${webview.cspSource} https:; script-src 'self' 'unsafe-inline' ${webview.cspSource} vscode-resource:; style-src 'self' 'unsafe-inline' ${webview.cspSource} vscode-resource: https:;" />`
            + head
            + `<style>
            a.psd-button {
                display: inline-block;
                cursor:pointer;
                padding: 1px 6px;
                border: 1px solid #999;
                border-radius: 3px;
                background-color: transparent;
                color: revert;
                font-weight: normal;
                font-size: 0.6rem;
                text-decoration: none;
                width:60px;
                text-align:center;
                margin-right: 4px;
            }
            .clipping{
                animation-name:fadeInAnime;
                animation-duration:0.4s;
                animation-fill-mode:forwards;
                opacity:0;
            }
            @keyframes fadeInAnime{
                from {opacity: 0;}
                to {opacity: 1;}
            }
            </style>`
            + `</head><body>`
            + `<div style="margin:1px 0 3px 0; padding:0;user-select: none;">
            <a class="psd-button" onclick="SaveImageAs('png', 0, false);" title="Save image as PNG. (Raw data)">PNG</a>
            <a class="psd-button" onclick="SaveImageAs('png', 1, false);" title="Save image as PNG. (As you see it)">PNG*</a>
            <a class="psd-button" onclick="SaveImageAs('jpg', 1, false);" title="Save image as JPEG. (As you see it)">JPEG</a>
            <a class="psd-button" onclick="SaveImageAs('svg', 0, false);" title="Save image as PNG. (Raw data)">SVG</a>
            <a class="psd-button" onclick="SaveImageAs('png', 0, true);" title="Save image to Clipboard. (PNG/Raw data)">Clipboard</a>
            </div>`
            + `<script>
            function SaveImageAs(fileType, mode, isClip){
                var svg = document.querySelector("svg");
                var svgData = new XMLSerializer().serializeToString(svg);
                if(fileType==="svg")
                {
                    var a = document.createElement("a");
                    a.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
                    a.setAttribute("download", "` + fileName + `." + fileType);
                    a.dispatchEvent(new MouseEvent("click"));
                    return;
                }
                var psdSvgContainer = document.querySelector("div.psd-svg-container");
                var svgBc = psdSvgContainer.style.backgroundColor || "transparent";
                var canvas = document.createElement("canvas");
                var box = svg.viewBox.baseVal;
                canvas.width = box.width;
                canvas.height = box.height;
                var ctx = canvas.getContext("2d");
                var image = new Image;
                image.onload = function(){
                    if(mode===1){
                        ctx.beginPath();
                        ctx.fillStyle = svgBc;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.closePath();
                    }
                    ctx.drawImage( image, 0, 0 );
                    if(isClip){
                        psdSvgContainer.classList.add("clipping");
                        canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]));
                        setTimeout(function(){psdSvgContainer.classList.remove("clipping")},600);
                        return;
                    }
                    var a = document.createElement("a");
                    a.href = canvas.toDataURL("image/" + fileType);
                    a.setAttribute("download", "` + fileName + `." + fileType);
                    a.dispatchEvent(new MouseEvent("click"));
                }
                image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgData))); 
            }
            </script>`
            + body
            + `</body><html>`;
    }
}
exports.Misc = Misc;


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isPreviewableLanguage = isPreviewableLanguage;
exports.getSnippetKind = getSnippetKind;
exports.resolveMermaidPreviewConfig = resolveMermaidPreviewConfig;
exports.resolveMscgenPreviewConfig = resolveMscgenPreviewConfig;
exports.resolveMermaidImports = resolveMermaidImports;
exports.getDownloadBaseName = getDownloadBaseName;
const path = __webpack_require__(2);
const previewableLanguageIds = new Set(['mermaid', 'mmd', 'mscgen', 'msgenny', 'xu']);
const mermaidLanguageIds = new Set(['mermaid', 'mmd']);
const mscgenLanguageIds = new Set(['mscgen', 'msgenny', 'xu']);
const mermaidStyles = new Set(['dark', 'forest', 'neutral']);
const mscgenStyles = new Set(['classic', 'cygne', 'fountainpen', 'lazy', 'pegasse']);
function isPreviewableLanguage(languageId) {
    return previewableLanguageIds.has(languageId);
}
function getSnippetKind(languageId) {
    if (mermaidLanguageIds.has(languageId)) {
        return 'mermaid';
    }
    if (mscgenLanguageIds.has(languageId)) {
        return 'mscgen';
    }
    return 'default';
}
function resolveMermaidPreviewConfig(configuredStyle, configuredBackgroundColor, fallbackBackgroundColor) {
    return {
        fixedStyle: mermaidStyles.has(configuredStyle)
            ? configuredStyle
            : 'forest',
        fixedBackgroundColor: configuredBackgroundColor !== null && configuredBackgroundColor !== void 0 ? configuredBackgroundColor : fallbackBackgroundColor,
    };
}
function resolveMscgenPreviewConfig(configuredStyle, configuredAlignment) {
    return {
        fixedNamedStyle: mscgenStyles.has(configuredStyle)
            ? configuredStyle
            : 'cygne',
        horizontalAlignment: configuredAlignment === 'fixed'
            ? 'fixed'
            : 'stretch',
    };
}
function resolveMermaidImports(text, sourceFilePath, readFile) {
    const directory = path.dirname(sourceFilePath);
    return text.replace(/%%[ \t]+import[ \t]?:[ \t]?(.+)/g, (_, subsequenceFile) => {
        const fileName = path.join(directory, subsequenceFile.trim());
        return readFile(fileName).replace(/sequenceDiagram/g, '');
    });
}
function getDownloadBaseName(sourceFileName) {
    return path.parse(sourceFileName || 'PreviewSeqDiagImage').name || 'PreviewSeqDiagImage';
}


/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MermaidCodeSnippet = void 0;
const vscode = __webpack_require__(1);
const fs = __webpack_require__(8);
const Path = __webpack_require__(2);
const misc_1 = __webpack_require__(5);
const previewLogic_1 = __webpack_require__(6);
const backgroundColorDefault = "#fafaf6";
class MermaidCodeSnippet {
    constructor() { }
    static get instance() {
        if (!this._instance) {
            this._instance = new MermaidCodeSnippet();
        }
        return this._instance;
    }
    createCodeSnippet(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = this.resolveImports(context.document, context.document.getText());
            return this.previewSnippet(context, text, this.getConfig());
        });
    }
    getConfig() {
        const previewConfig = vscode.workspace.getConfiguration('previewSeqDiag');
        return (0, previewLogic_1.resolveMermaidPreviewConfig)(previewConfig.get('mermaid.fixedStyle'), previewConfig.get('mermaid.fixedBackgroundColor'), backgroundColorDefault);
    }
    resolveImports(document, text) {
        try {
            return (0, previewLogic_1.resolveMermaidImports)(text, document.uri.fsPath, (fileName) => fs.readFileSync(fileName, 'utf8'));
        }
        catch (err) {
            console.error(err);
            return text;
        }
    }
    previewSnippet(context, payLoad, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsPath = vscode.Uri.file(Path.join(context.extensionPath, 'dist', 'mermaid', 'mermaid.min.js'));
            const jsSrc = context.webview.asWebviewUri(jsPath);
            return misc_1.Misc.getFormattedHtml(`<script type="module" src="${jsSrc}"></script>
            <script type="text/javascript">mermaid.initialize({startOnLoad:true, theme:"${config.fixedStyle}"});</script>`, `<div style="color:transparent;">
                <div class="mermaid psd-svg-container" style="background-color:${config.fixedBackgroundColor}">${payLoad}</div>
                <style>.psd-svg-container svg{height:auto !important;}</style>
            </div>`, context.webview, context.document.fileName);
        });
    }
}
exports.MermaidCodeSnippet = MermaidCodeSnippet;


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MscgenCodeSnippet = void 0;
const vscode = __webpack_require__(1);
const misc_1 = __webpack_require__(5);
const Path = __webpack_require__(2);
const previewLogic_1 = __webpack_require__(6);
class MscgenCodeSnippet {
    constructor() { }
    static get instance() {
        if (!this._instance) {
            this._instance = new MscgenCodeSnippet();
        }
        return this._instance;
    }
    createCodeSnippet(context) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.previewSnippet(context, context.document.getText(), this.getConfig());
        });
    }
    getConfig() {
        const previewConfig = vscode.workspace.getConfiguration('previewSeqDiag');
        return (0, previewLogic_1.resolveMscgenPreviewConfig)(previewConfig.get('mscgen.fixedNamedStyle'), previewConfig.get('mscgen.horizontalAlignment'));
    }
    previewSnippet(context, payLoad, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsPath = vscode.Uri.file(Path.join(context.extensionPath, 'dist', 'mscgenjs-inpage', 'mscgen-inpage.js'));
            const jsSrc = context.webview.asWebviewUri(jsPath);
            return misc_1.Misc.getFormattedHtml(`<script type="text/javascript">var mscgen_js_config = {};</script>
            <script src="${jsSrc}" defer></script>`
                + ((config.horizontalAlignment === 'stretch') ? `<style type="text/css"> svg {width:100%;} </style>` : ``), `<div class="psd-svg-container"><script
                    style="color:transparent;" 
                    type="text/x-${context.document.languageId}" 
                    data-named-style="${config.fixedNamedStyle}" 
                    data-regular-arc-text-vertical-alignment="above">
                    ${payLoad}
                </script>
                <style>.psd-svg-container svg{height:auto !important;}</style>
            </div>
            `, context.webview, context.document.fileName);
        });
    }
}
exports.MscgenCodeSnippet = MscgenCodeSnippet;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __webpack_require__(1);
const path = __webpack_require__(2);
const previewSeqDiagPanel_1 = __webpack_require__(3);
function activate(context) {
    const previewPanel = new previewSeqDiagPanel_1.PreviewSeqDiagPanel();
    previewPanel.setExtensionPath(context.extensionPath);
    let updateTimer;
    const scheduleUpdate = () => {
        if (updateTimer) {
            clearTimeout(updateTimer);
        }
        updateTimer = setTimeout(() => {
            void previewPanel.update();
        }, 500);
    };
    let showPreview = vscode.commands.registerCommand('previewSeqDiag.showPreview', () => {
        const panel = vscode.window.createWebviewPanel('previewSeqDiag', 'Preview Sequence Diagrams', vscode.ViewColumn.Two, {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, 'dist/mermaid')),
                vscode.Uri.file(path.join(context.extensionPath, 'dist/mscgenjs-inpage')),
            ]
        });
        previewPanel.setCurrentWebViewPanel(panel);
        panel.onDidDispose(() => {
            previewPanel.setCurrentWebViewPanel(null);
        }, null, context.subscriptions);
        void previewPanel.update();
    });
    context.subscriptions.push(showPreview);
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor === vscode.window.activeTextEditor) {
            void previewPanel.update(editor);
        }
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
        var _a;
        if (e.document === ((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document)) {
            scheduleUpdate();
        }
    }));
    context.subscriptions.push(new vscode.Disposable(() => {
        if (updateTimer) {
            clearTimeout(updateTimer);
        }
    }));
}
// this method is called when your extension is deactivated
function deactivate() { }

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map