'use strict';

import * as vscode from 'vscode';
import { CodeSnippetInterface } from './codeSnippetInterface';
import { Misc } from './misc';


export class DefaultCodeSnippet implements CodeSnippetInterface
{
    private static _instance:DefaultCodeSnippet;

    private constructor()
    { }

    public static get instance():DefaultCodeSnippet
    {
        if (!this._instance)
            this._instance = new DefaultCodeSnippet();
            
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
        return this.previewSnippet(languageId, extentiponPath, text);
    }

    private async errorSnippet(error: string): Promise<string>
    {
        return Misc.getFormattedHtml("",error);
    }

    private async previewSnippet(languageId: string, extentiponPath:string, payLoad: string): Promise<string>
    {
        return Misc.getFormattedHtml(`
            `,`
            ${payLoad}
            `);
    }
}
