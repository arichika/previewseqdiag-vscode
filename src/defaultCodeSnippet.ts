'use strict';

import * as vscode from 'vscode';
import { workspace, window, commands, ExtensionContext } from 'vscode';
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

    public async createCodeSnippet(): Promise<string>
    {
        return this.extractSnippet();
    }

    private async extractSnippet(): Promise<string>
    {
        let editor = vscode.window.activeTextEditor;
        let text = editor.document.getText();
        return this.previewSnippet(text);
    }

    private async errorSnippet(error: string): Promise<string>
    {
        return Misc.getFormattedHtml("",error);
    }

    private async previewSnippet(payLoad: string): Promise<string>
    {
        return Misc.getFormattedHtml(`
            `,`
            ${payLoad}
            `);
    }
}
