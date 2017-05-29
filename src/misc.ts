'use strict';

import * as vscode from 'vscode';
import * as Path from 'path';

export class Misc
{
    public static previewUri = vscode.Uri.parse('previewSeqDiag://authority/previewSeqDiag');

    public static getCustomPreviewUri(path: string): string
    {
        return this.previewUri.toString() + "/" + path
    }

    public static getExtensionRootPath(): string
    {
        return Path.join(
            __dirname,
            "..",
            ".."
        ).replace(/\\/g, '/');
    }

    public static getFormattedHtml(head: string, body: string ): string
    {
        return `<html><head>`
            + head
            + `</head><body>`
            + body +
            `</body><html>`;
    }
}
