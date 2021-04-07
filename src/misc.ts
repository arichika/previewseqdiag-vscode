'use strict';

import * as vscode from 'vscode';
import * as Path from 'path';

export class Misc
{
    public static previewUri = vscode.Uri.parse('previewSeqDiag://authority/previewSeqDiag');

    public static getFormattedHtml(head: string, body: string, webview: vscode.Webview): string
    {
        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">`
            + `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob: ${webview.cspSource} https:; script-src 'self' 'unsafe-inline' ${webview.cspSource} vscode-resource:; style-src 'self' 'unsafe-inline' ${webview.cspSource} vscode-resource: https:;" />`
            + head
            + `</head><body>`
            + body
            + `</body><html>`;
    }
}
