# Preview Sequence Diagrams 

## README

Preview Sequence Diagrams (previewseqdiag-vscode) is an extension for vscode specialized for the preview function of mscgen and mermaid.

![eye-catch](assets/eye-catch.png)

## Features

* Support to preview of Mermaid format.
* Support to preview of MscGen, MsGenny format.
* Support to automatically change the style according to the theme of VSCode. (Only Mermaid)

## Release Notes

[CHANGELOG.md](CHANGELOG.md)

### 0.0.1

Initial release.

## Known Issues

* In the current release, I only consider the Windows platform and develop it.　So, There should be something wrong.
* SVG or PNG downloading is not supported. If you want to download by SVG or PNG, It is good to use lang's official websites. see, [Appendix](#appendix)


## Requirements

### Dependencies

* npm rx
* npm mermaid
* npm mscgenjs / mscgenjs-inpage
* vscode extention mscgenjs.vscode-mscgen

## Extension Settings

This extension contributes the following settings:

* `previewSeqDiag.mermaid.fixedStyle`: Setting to force usage for Mermaid's preview's rendering style. 
  * Set `dark`, `forest`, `""` or `null` (= Switch according to the theme of VSCode)
* `previewSeqDiag.mermaid.fixedBackgroundColor`: Setting to force usage for Mermaid's preview's  background colo. 
  * Set `#rrggbb` e.g. #ffffff, `transparent` or `null` (= Depends on VSCode's Theme)
* `previewSeqDiag.mscgen.fixedNamedStyle`: Setting to force usage for Mscgen, MsGenny, xu's preview's rendering style.
  * Set `lazy`, `classic`, `cygne`, `pegasse`, `fountainpen` or `null` (= cygne). (see [Name Style](https://mscgen.js.org/embed.html#named-styles))

e.g. 
```
    "previewSeqDiag.mermaid.fixedStyle":"forest",
    "previewSeqDiag.mermaid.fixedBackgroundColor":"#ffffff",
    "previewSeqDiag.mscgen.fixedNamedStyle": "fountainpen",
```

this is.

![mermaid-forest-white](assets/mermaid-forest-white.png)  
![mscgen-fountainpen.png](assets/mscgen-fountainpen.png)



----

## Appendix

### Great thanks to

* [searKing/preview-vscode](https://github.com/searKing/preview-vscode)

### mermaid
* [knsv/mermaid](https://github.com/knsv/mermaid)
* [mermaid docs](https://knsv.github.io/mermaid/)
* [mermaid live editor](https://knsv.github.io/mermaid/live_editor/) you can download by SVG.

### mscgen
* [Mscgen](http://www.mcternan.me.uk/mscgen/)
* [mscgen_js](https://mscgen.js.org/) you can download by SVG or PNG.

### samples

Mermaid, graph, forest, with light theme.
![graph](assets/mermaid-forest-default-graph.png)

Mermaid, gantt, dark, with dark theme.
![graph](assets/mermaid-dark-default-gantt.png)

MscGen, msc, cygne, with dark theme.
![graph](assets/mscgen-cygne.png)
