'use strict';

export interface CodeSnippetInterface
{
    createCodeSnippet(languageId:string): Promise<string>;
}