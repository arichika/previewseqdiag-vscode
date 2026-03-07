'use strict';

import * as path from 'path';

export type PreviewSnippetKind = 'default' | 'mermaid' | 'mscgen';

export type MermaidStyleName = 'dark' | 'forest' | 'neutral';
export type MscgenStyleName = 'classic' | 'cygne' | 'fountainpen' | 'lazy' | 'pegasse';
export type Alignment = 'fixed' | 'stretch';

export interface MermaidPreviewConfig
{
    fixedStyle: MermaidStyleName;
    fixedBackgroundColor: string;
}

export interface MscgenPreviewConfig
{
    fixedNamedStyle: MscgenStyleName;
    horizontalAlignment: Alignment;
}

const previewableLanguageIds = new Set(['mermaid', 'mmd', 'mscgen', 'msgenny', 'xu']);
const mermaidLanguageIds = new Set(['mermaid', 'mmd']);
const mscgenLanguageIds = new Set(['mscgen', 'msgenny', 'xu']);
const mermaidStyles = new Set<MermaidStyleName>(['dark', 'forest', 'neutral']);
const mscgenStyles = new Set<MscgenStyleName>(['classic', 'cygne', 'fountainpen', 'lazy', 'pegasse']);

export function isPreviewableLanguage(languageId: string): boolean
{
    return previewableLanguageIds.has(languageId);
}

export function getSnippetKind(languageId: string): PreviewSnippetKind
{
    if (mermaidLanguageIds.has(languageId)) {
        return 'mermaid';
    }

    if (mscgenLanguageIds.has(languageId)) {
        return 'mscgen';
    }

    return 'default';
}

export function resolveMermaidPreviewConfig(
    configuredStyle: string | undefined,
    configuredBackgroundColor: string | undefined,
    fallbackBackgroundColor: string,
): MermaidPreviewConfig
{
    return {
        fixedStyle: mermaidStyles.has(configuredStyle as MermaidStyleName)
            ? configuredStyle as MermaidStyleName
            : 'forest',
        fixedBackgroundColor: configuredBackgroundColor ?? fallbackBackgroundColor,
    };
}

export function resolveMscgenPreviewConfig(
    configuredStyle: string | undefined,
    configuredAlignment: string | undefined,
): MscgenPreviewConfig
{
    return {
        fixedNamedStyle: mscgenStyles.has(configuredStyle as MscgenStyleName)
            ? configuredStyle as MscgenStyleName
            : 'cygne',
        horizontalAlignment: configuredAlignment === 'fixed'
            ? 'fixed'
            : 'stretch',
    };
}

export function resolveMermaidImports(
    text: string,
    sourceFilePath: string,
    readFile: (fileName: string) => string,
): string
{
    const directory = path.dirname(sourceFilePath);

    return text.replace(/%%[ \t]+import[ \t]?:[ \t]?(.+)/g, (_, subsequenceFile) => {
        const fileName = path.join(directory, subsequenceFile.trim());
        return readFile(fileName).replace(/sequenceDiagram/g, '');
    });
}

export function getDownloadBaseName(sourceFileName: string | undefined): string
{
    return path.parse(sourceFileName || 'PreviewSeqDiagImage').name || 'PreviewSeqDiagImage';
}
