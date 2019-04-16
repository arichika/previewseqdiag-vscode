'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { Misc } from './misc';


type StyleName = "classic" | "cygne" | "fountainpen" | "lazy" | "pegasse";
namespace StyleName{
    export const Classic = "classic"
    export const Cygne = "cygne"
    export const Fountainpen = "fountainpen"
    export const Lazy = "lazy"
    export const Pegasse = "pegasse"
}

type Alignment = "fixed" | "stretch";
namespace Alignment{
    export const Fixed = "fixed"
    export const Stretch = "stretch"
}

class ConfigMscgen
{
    public fixedNamedStyle: StyleName;
    public horizontalAlignment: Alignment;
}


export class MscgenCodeSnippet implements CodeSnippetInterface
{
    private static _instance:MscgenCodeSnippet;

    private _configMscgen: ConfigMscgen;

    private constructor()
    {
        this._configMscgen = new ConfigMscgen();

        // defaults
        this._configMscgen.fixedNamedStyle = StyleName.Cygne;
        this._configMscgen.horizontalAlignment = Alignment.Stretch;

        var config = vscode.workspace.getConfiguration('previewSeqDiag');
        if(!!config && !!config.mscgen)
        {
            // fixedNamedStyle
            switch(config.mscgen.fixedNamedStyle)
            {
                case StyleName.Classic:
                case StyleName.Cygne:
                case StyleName.Fountainpen:
                case StyleName.Lazy:
                case StyleName.Pegasse:
                    this._configMscgen.fixedNamedStyle = config.mscgen.fixedNamedStyle;
                    break;

                default:
                    break;
            }

            // horizontalAlignment
            switch(config.mscgen.horizontalAlignment)
            {
                case Alignment.Fixed:
                    this._configMscgen.horizontalAlignment = Alignment.Fixed;
                    break;

                default:
                    break;
            }
        }
    }

    public static get instance():MscgenCodeSnippet
    {
        if (!this._instance)
            this._instance = new MscgenCodeSnippet();
            
        return this._instance;
    }
    
    public async createCodeSnippet(languageId: string, extentiponPath:string): Promise<string>
    {
        return this.extractSnippet(languageId, extentiponPath);
    }

    private async extractSnippet(languageId: string, extentiponPath:string): Promise<string>
    {
        let editor = vscode.window.activeTextEditor;
        let text = editor.document.getText();
        return this.previewSnippet(languageId,extentiponPath, text);
    }

    private async errorSnippet(error: string): Promise<string>
    {
        return Misc.getFormattedHtml("",error);
    }

    private async previewSnippet(languageId: string, extentiponPath:string, payLoad: string): Promise<string>
    {
        return Misc.getFormattedHtml(
            `
            <script type="text/javascript">
                var mscgen_js_config = {};
            </script>
            <script src='vscode-resource:${extentiponPath}/node_modules/mscgenjs-inpage/dist/mscgen-inpage.js' defer></script>
            `
            + ((this._configMscgen.horizontalAlignment === Alignment.Stretch) ? `<style type="text/css"> svg {width:100%;} </style>` : ``)
            ,
            `
            <div>
                <script
                    style='color:transparent;' 
                    type='text/x-${languageId}' 
                    data-named-style='${this._configMscgen.fixedNamedStyle}' 
                    data-regular-arc-text-vertical-alignment='above'>
                    ${payLoad}
                </script>
            </div>
            <div>
                <a href="https://mscgen.js.org/" style="color:#999999;">mscgen.js Official site.</a>
            </div>
            `);
    }
}
