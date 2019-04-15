'use strict';

import * as vscode from 'vscode';
import * as Path from 'path';

export class Misc
{
    public static previewUri = vscode.Uri.parse('previewSeqDiag://authority/previewSeqDiag');

    public static getFormattedHtml(head: string, body: string ): string
    {
        return `<html><head>`
            + `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource: 'self' 'unsafe-inline'; style-src vscode-resource: 'self' 'unsafe-inline';">`
            + head
            + `</head><body>`
            + body +
            `</body><html>`;
    }

}
