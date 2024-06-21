// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from "vscode";
// import fs from "fs";
// import { context as esContext } from "esbuild";
// import { join, parse, basename, dirname } from "path";
const vscode = require('vscode');
const { context: esContext } = require('./modules/esbuild');
const fs = require('fs');
const { join, parse, basename, dirname } = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let dispJs = vscode.workspace.onDidSaveTextDocument(async e => {
    if (['javascript', 'typescript'].includes(e.languageId)) {
      const { identificationIdentifier, generateIdentifier } = vscode.workspace.getConfiguration('jse');
      const identifier = identificationIdentifier + e.fileName.slice(-3);
      const ishz = basename(e.fileName).endsWith(identifier);
      if (!ishz) return;
      const filePath = join(dirname(e.fileName), basename(e.fileName));
      const fileName = parse(basename(e.fileName)).name;
      const outputPath = join(dirname(e.fileName), `${fileName}${generateIdentifier}.js`).replace(identificationIdentifier, '');
      const terser = {
        name: 'terser',
        setup(build) {
          build.onEnd(async () => {
            const terser = require('./terser');
            let code = await fs.promises.readFile(outputPath, 'utf8');
            const result = terser.minify_sync(code, {
              mangle: {
                toplevel: true,
              },
              compress: {
                passes: 3, // 多次压缩
                keep_fnames: true,
                booleans: true, // 优化布尔值
                dead_code: true, // 移除未使用的代码
                drop_console: false, // 移除console.*调用
                drop_debugger: false, // 移除debugger声明
                conditionals: true, // 优化if-s、比较等
                evaluate: true, // 计算常量表达式
                sequences: true, // 使用逗号运算符
                toplevel: true, // 处理顶层作用域
              },
              output: {
                beautify: false, // 禁用美化
                comments: false, // 移除所有注释
              },
            });
            const jsob = require('./jsob.js');
            result.code = jsob.obfuscate(result.code, {
              compact: true, // 压缩代码：否
              controlFlowFlattening: false, // 控制流扁平化：否
              deadCodeInjection: false, // 注入死代码：否
              debugProtection: false, // 调试保护：否
              disableConsoleOutput: false, // 禁用控制台输出：否
              identifierNamesGenerator: 'mangled', // 标识符名称生成器：混淆
              log: false, // 日志：否
              numbersToExpressions: false, // 数字转换为表达式：否
              renameGlobals: false, // 重命名全局变量：否
              rotateStringArray: true, // 旋转字符串数组：是
              selfDefending: false, // 自我防御：否
              shuffleStringArray: true, // 洗牌字符串数组：是
              simplify: true, // 简化代码：是
              splitStrings: true, // 拆分字符串：否
              stringArray: true, // 使用字符串数组：是
              stringArrayEncoding: [], // 字符串数组编码：无（空数组）
              stringArrayIndexShift: true, // 字符串数组索引偏移：是
              stringArrayWrappersCount: 1, // 字符串数组包装次数：1
              stringArrayWrappersChainedCalls: true, // 字符串数组包装链调用：是
              stringArrayWrappersParametersMaxCount: 2, // 字符串数组包装参数最大数量：2
              stringArrayWrappersType: 'variable', // 字符串数组包装类型：变量
              stringArrayThreshold: 0.75, // 字符串数组阈值：0.75
              unicodeEscapeSequence: false, // Unicode转义序列：否
            })._obfuscatedCode;
            await fs.promises.writeFile(outputPath, result.code);
          });
        },
      };
      const contexts = await esContext({
        entryPoints: [filePath],
        bundle: false,
        minify: false,
        sourcemap: false,
        sourcesContent: false,
        target: 'chrome80',
        outfile: outputPath,
        plugins: [terser],
        loader: { '.ts': 'ts' },
      });
      contexts.rebuild().then(() => {
        vscode.window.showInformationMessage('JSE run done. size: ' + parseFloat((fs.statSync(outputPath).size / 1024).toFixed(2)) + 'kb');
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
