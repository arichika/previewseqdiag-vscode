'use strict';

import * as vscode from 'vscode';
import * as Path from 'path';

export class Misc
{
    public static previewUri = vscode.Uri.parse('previewSeqDiag://authority/previewSeqDiag');

    public static getFormattedHtml(head: string, body: string, webview: vscode.Webview): string
    {
        var fileName = vscode.window.activeTextEditor?.document.fileName || "PreviewSeqDiagImage";
        fileName = fileName.substring(fileName.lastIndexOf("\\")+1).substring(fileName.lastIndexOf("/")+1);

        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">`
            + `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob: ${webview.cspSource} https:; script-src 'self' 'unsafe-inline' ${webview.cspSource} vscode-resource:; style-src 'self' 'unsafe-inline' ${webview.cspSource} vscode-resource: https:;" />`
            + head
            + `<style>
            a.psd-button {
                display: inline-block;
                cursor:pointer;
                padding: 1px 6px;
                border: 1px solid #999;
                border-radius: 3px;
                background-color: transparent;
                color: revert;
                font-weight: normal;
                font-size: 0.6rem;
                text-decoration: none;
                width:60px;
                text-align:center;
                margin-right: 4px;
            }
            .clipping{
                animation-name:fadeInAnime;
                animation-duration:0.4s;
                animation-fill-mode:forwards;
                opacity:0;
            }
            @keyframes fadeInAnime{
                from {opacity: 0;}
                to {opacity: 1;}
            }
            </style>`
            + `</head><body>`
            + `<div style="margin:1px 0 3px 0; padding:0;user-select: none;">
            <a class="psd-button" onclick="SaveImageAs('png', 0, false);" title="Save image as PNG. (Raw data)">PNG</a>
            <a class="psd-button" onclick="SaveImageAs('png', 1, false);" title="Save image as PNG. As you see it.">PNG*</a>
            <a class="psd-button" onclick="SaveImageAs('jpg', 0, false);" title="Save image as JPEG. (Raw data)">JPEG</a>
            <a class="psd-button" onclick="SaveImageAs('svg', 0, false);" title="Save image as PNG. (Raw data)">SVG</a>
            <a class="psd-button" onclick="SaveImageAs('png', 0, true);" title="Save image to Clipboard. (PNG/Raw data)">Clipboard</a>
            </div>`
            + `<script>
            function SaveImageAs(fileType, mode, isClip){
                var svg = document.querySelector("svg");
                var svgData = new XMLSerializer().serializeToString(svg);
                if(fileType==="svg")
                {
                    var a = document.createElement("a");
                    a.href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
                    a.setAttribute("download", "` + fileName + `." + fileType);
                    a.dispatchEvent(new MouseEvent("click"));
                    return;
                }
                var psdSvgContainer = document.querySelector("div.psd-svg-container");
                var svgBc = psdSvgContainer.style.backgroundColor || "transparent";
                var canvas = document.createElement("canvas");
                var box = svg.viewBox.baseVal;
                canvas.width = box.width;
                canvas.height = box.height;
                var ctx = canvas.getContext("2d");
                var image = new Image;
                image.onload = function(){
                    if(mode===1){
                        ctx.beginPath();
                        ctx.fillStyle = svgBc;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.closePath();
                    }
                    ctx.drawImage( image, 0, 0 );
                    if(isClip){
                        psdSvgContainer.classList.add("clipping");
                        canvas.toBlob(blob => navigator.clipboard.write([new ClipboardItem({'image/png': blob})]));
                        setTimeout(function(){psdSvgContainer.classList.remove("clipping")},600);
                        return;
                    }
                    var a = document.createElement("a");
                    a.href = canvas.toDataURL("image/" + fileType);
                    a.setAttribute("download", "` + fileName + `." + fileType);
                    a.dispatchEvent(new MouseEvent("click"));
                }
                image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgData))); 
            }
            </script>`
            + body
            + `</body><html>`;
    }
}
