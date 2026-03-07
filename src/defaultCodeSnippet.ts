'use strict';

import { CodeSnippetInterface, PreviewRenderContext } from './codeSnippetInterface';
import { Misc } from './misc';


export class DefaultCodeSnippet implements CodeSnippetInterface
{
    private static _instance:DefaultCodeSnippet;

    private constructor()
    { }

    public static get instance():DefaultCodeSnippet
    {
        if (!this._instance){
            this._instance = new DefaultCodeSnippet();
        }
            
        return this._instance;
    }

    public async createCodeSnippet(context: PreviewRenderContext): Promise<string>
    {
        return Misc.getFormattedHtml(
            '',
            context.document.getText(),
            context.webview,
            context.document.fileName);
    }
}
