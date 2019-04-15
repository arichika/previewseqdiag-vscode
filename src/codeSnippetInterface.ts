'use strict';

export interface CodeSnippetInterface
{
    createCodeSnippet(languageId:string, extentiponPath:string): Promise<string>;
}