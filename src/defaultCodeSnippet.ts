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
        if (!this._instance){
            this._instance = new DefaultCodeSnippet();
        }
            
        return this._instance;
    }

    public async createCodeSnippet(languageId: string, extentiponPath:string, webview: vscode.Webview): Promise<string>
    {
        return this.extractSnippet(languageId, extentiponPath,webview);
    }

    private async extractSnippet(languageId: string, extentiponPath:string, webview: vscode.Webview): Promise<string>
    {
        let editor = vscode.window.activeTextEditor;
        let text = editor?.document.getText();
        return this.previewSnippet(languageId, extentiponPath, text||"",webview);
    }

    private async errorSnippet(error: string, webview: vscode.Webview): Promise<string>
    {
        return Misc.getFormattedHtml("",error,webview);
    }

    private async previewSnippet(languageId: string, extentiponPath:string, payLoad: string, webview: vscode.Webview): Promise<string>
    {
        return Misc.getFormattedHtml(
            ``
            ,`${payLoad}`,
            webview);
    }
}
