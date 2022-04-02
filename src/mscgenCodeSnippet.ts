'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';
import { CodeSnippetInterface } from './codeSnippetInterface';
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

class ConfigMscgen
{
    public fixedNamedStyle: StyleName = StyleName.classic;
    public horizontalAlignment: Alignment = Alignment.stretch;
}


export class MscgenCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MscgenCodeSnippet;

    private _configMscgen: ConfigMscgen;

    private constructor()
    {
        this._configMscgen = new ConfigMscgen();

        // defaults
        this._configMscgen.fixedNamedStyle = StyleName.cygne;
        this._configMscgen.horizontalAlignment = Alignment.stretch;

        var config = vscode.workspace.getConfiguration('previewSeqDiag');
        if(!!config && !!config.mscgen)
        {
            // fixedNamedStyle
            switch(config.mscgen.fixedNamedStyle)
            {
                case StyleName.classic:
                case StyleName.cygne:
                case StyleName.fountainpen:
                case StyleName.lazy:
                case StyleName.pegasse:
                    this._configMscgen.fixedNamedStyle = config.mscgen.fixedNamedStyle;
                    break;

                default:
                    break;
            }

            // horizontalAlignment
            switch(config.mscgen.horizontalAlignment)
            {
                case Alignment.fixed:
                    this._configMscgen.horizontalAlignment = Alignment.fixed;
                    break;

                default:
                    break;
            }
        }
    }

    public static get instance():MscgenCodeSnippet
    {
        if (!this._instance){
            this._instance = new MscgenCodeSnippet();
        }
            
        return this._instance;
    }
    
    public async createCodeSnippet(languageId: string, extentiponPath:string, webview: vscode.Webview): Promise<string>
    {
        return this.extractSnippet(languageId, extentiponPath, webview);
    }

    private async extractSnippet(languageId: string, extentiponPath:string, webview: vscode.Webview): Promise<string>
    {
        let editor = vscode.window.activeTextEditor;
        let text = editor?.document.getText() || "";
        return this.previewSnippet(languageId,extentiponPath, text, webview);
    }

    private async errorSnippet(error: string, webview: vscode.Webview): Promise<string>
    {
        return Misc.getFormattedHtml("",error, webview);
    }

    private async previewSnippet(languageId: string, extentiponPath:string, payLoad: string, webview: vscode.Webview): Promise<string>
    {
        var jsPath = vscode.Uri.file(Path.join(extentiponPath, 'dist','mscgenjs-inpage', 'mscgen-inpage.js'));
        const jsSrc = webview.asWebviewUri(jsPath);
        return Misc.getFormattedHtml(
            `<script type="text/javascript">var mscgen_js_config = {};</script>
            <script src="${jsSrc}" defer></script>`
            + ((this._configMscgen.horizontalAlignment === Alignment.stretch) ? `<style type="text/css"> svg {width:100%;} </style>` : ``)
            ,
            `<div class="psd-svg-container"><script
                    style="color:transparent;" 
                    type="text/x-${languageId}" 
                    data-named-style="${this._configMscgen.fixedNamedStyle}" 
                    data-regular-arc-text-vertical-alignment="above">
                    ${payLoad}
                </script>
                <style>.psd-svg-container svg{height:auto !important;}</style>
            </div>
            `,
            webview);
    }
}
