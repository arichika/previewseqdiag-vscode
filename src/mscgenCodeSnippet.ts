'use strict';

import * as vscode from 'vscode';
import { CodeSnippetInterface, PreviewRenderContext } from './codeSnippetInterface';
import { Misc } from './misc';
import * as Path from 'path';


type StyleName = "classic" | "cygne" | "fountainpen" | "lazy" | "pegasse";
namespace StyleName{
    export const classic = "classic";
    export const cygne = "cygne";
    export const fountainpen = "fountainpen";
    export const lazy = "lazy";
    export const pegasse = "pegasse";
}

type Alignment = "fixed" | "stretch";
namespace Alignment{
    export const fixed = "fixed";
    export const stretch = "stretch";
}

interface ConfigMscgen
{
    fixedNamedStyle: StyleName;
    horizontalAlignment: Alignment;
}

const mscgenStyles = new Set<StyleName>([
    StyleName.classic,
    StyleName.cygne,
    StyleName.fountainpen,
    StyleName.lazy,
    StyleName.pegasse,
]);


export class MscgenCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MscgenCodeSnippet;

    private constructor() {}

    public static get instance():MscgenCodeSnippet
    {
        if (!this._instance){
            this._instance = new MscgenCodeSnippet();
        }
            
        return this._instance;
    }
    
    public async createCodeSnippet(context: PreviewRenderContext): Promise<string>
    {
        return this.previewSnippet(context, context.document.getText(), this.getConfig());
    }

    private getConfig(): ConfigMscgen
    {
        const previewConfig = vscode.workspace.getConfiguration('previewSeqDiag');
        const configuredStyle = previewConfig.get<string>('mscgen.fixedNamedStyle');
        const configuredAlignment = previewConfig.get<string>('mscgen.horizontalAlignment');

        return {
            fixedNamedStyle: mscgenStyles.has(configuredStyle as StyleName)
                ? configuredStyle as StyleName
                : StyleName.cygne,
            horizontalAlignment: configuredAlignment === Alignment.fixed
                ? Alignment.fixed
                : Alignment.stretch,
        };
    }

    private async previewSnippet(context: PreviewRenderContext, payLoad: string, config: ConfigMscgen): Promise<string>
    {
        const jsPath = vscode.Uri.file(Path.join(context.extensionPath, 'dist', 'mscgenjs-inpage', 'mscgen-inpage.js'));
        const jsSrc = context.webview.asWebviewUri(jsPath);
        return Misc.getFormattedHtml(
            `<script type="text/javascript">var mscgen_js_config = {};</script>
            <script src="${jsSrc}" defer></script>`
            + ((config.horizontalAlignment === Alignment.stretch) ? `<style type="text/css"> svg {width:100%;} </style>` : ``)
            ,
            `<div class="psd-svg-container"><script
                    style="color:transparent;" 
                    type="text/x-${context.document.languageId}" 
                    data-named-style="${config.fixedNamedStyle}" 
                    data-regular-arc-text-vertical-alignment="above">
                    ${payLoad}
                </script>
                <style>.psd-svg-container svg{height:auto !important;}</style>
            </div>
            `,
            context.webview,
            context.document.fileName);
    }
}
