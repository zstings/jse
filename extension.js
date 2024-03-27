// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from "vscode";
// import fs from "fs";
// import { context as esContext } from "esbuild";
// import { join, parse, basename, dirname } from "path";
const vscode = require("vscode");
const { context: esContext } = require("./modules/esbuild");
const fs = require("fs");
const { join, parse, basename, dirname } = require("path");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let isAutoSave = true;
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let dispJs = vscode.workspace.onDidSaveTextDocument(async (e) => {
    if (e.languageId === "javascript" || e.languageId === "typescript") {
      if (isAutoSave == false) return;
      const { isEval } = vscode.workspace.getConfiguration("jse");

      const filePath = join(dirname(e.fileName), basename(e.fileName));
      const fileName = parse(basename(e.fileName)).name;
      const outputPath = join(dirname(e.fileName), `${fileName}.min.js`);

      const examplePlugin = {
        name: "example",
        setup(build) {
          build.onEnd(async () => {
            const packer = require("./packer");
            let content = await fs.promises.readFile(outputPath, "utf8");
            content = packer(content);
            await fs.promises.writeFile(outputPath, content);
          });
        },
      };
      const contexts = await esContext({
        entryPoints: [filePath],
        bundle: false,
        minify: false,
        sourcemap: false,
        sourcesContent: false,
        target: "chrome80",
        outfile: outputPath,
        plugins: isEval ? [examplePlugin] : [], // [examplePlugin]
        loader: { ".ts": "ts" },
      });
      contexts.rebuild().then(() => {
        vscode.window.showInformationMessage("JSE run done");
      });
      contexts.dispose();

      // fs.writeFile(outputPath, text, (err) => {
      //   if (err) {
      //     vscode.window.showErrorMessage("Failed to minify file.");
      //   } else {
      //     vscode.window.showInformationMessage("File minified successfully.");
      //   }
      // });
    }
  });
  context.subscriptions.push(dispJs);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = { activate, deactivate };
