// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from "vscode";
// import fs from "fs";
// import { context as esContext } from "esbuild";
// import { join, parse, basename, dirname } from "path";
const { exec } = require('child_process');
const vscode = require('vscode');
// const { context: esContext } = require('./modules/esbuild');
const fs = require('fs');
const { join, parse, basename, dirname, resolve } = require('path');
const packer = require('./core/packer.js')
const terser = require('./core/terser.js')
const axios = require('./core/axios.js')
console.log(56, axios.post)
console.log(packer.pack(`console.log('111  22')`, false, true))
console.log(packer.pack(`console.log(\`1    11\`)`, false, true))
console.log(packer.pack(`console.log(\`https://www.cs.com asdas asad   asd 1\`)`, false, true))
console.log(packer.pack('console.log(`https://asd.csds`)', false, true))
// console.log(1, resolve(__dirname, './packer.html'), jsdom)
let newloading = false
// 状态栏按钮注册
function createStatusBarItem(text, tooltip, command) {
  const myButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  )
  myButton.tooltip = tooltip
  myButton.text = text
  myButton.color = "white"
  myButton.command = command
  myButton.show()
  return myButton
}
// 加密函数
async function jsTerser(_, type, c = true){
  // 获取当前活动的编辑器
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document.languageId == 'javascript') {
    // 获取设置 generateIdentifier = '.min'  identificationIdentifier = '.bak'
    const { identificationIdentifier, generateIdentifier } = vscode.workspace.getConfiguration('jse');
    // 得到后缀 .bak.js
    const identifier = identificationIdentifier + editor.document.fileName.slice(-3);
    // 判断当前文件的后最是否符合identifier
    const ishz = basename(editor.document.fileName).endsWith(identifier);
    if (!c && !ishz) return vscode.window.showInformationMessage('文件后缀与设置不符');
    if (newloading) return vscode.window.showInformationMessage('有任务正在运行，请稍后再试');
    let jseCode = ''
    if (type == '01') {
      // 调用 terser
      const result = terser.minify_sync(editor.document.getText(), {
        compress: {
          passes: 3, // 多次压缩
          keep_fnames: true, // 保留函数名
          booleans: true, // 优化布尔值
          dead_code: true, // 移除那些永远不会执行的代码块，例如无条件的 return 后的代码块，或 if (false) 中的代码块
          drop_console: false, // 移除console.*调用
          drop_debugger: false, // 移除debugger声明
          conditionals: true, // 优化if-s、比较等
          evaluate: true, // 计算常量表达式
          sequences: true, // 使用逗号运算符
          toplevel: false, // 处理顶层作用域
          unused: false, // 不移除未使用的代码
          inline: false, // 禁用内联优化
        },
        output: {
          beautify: false, // 禁用美化
          comments: false, // 移除所有注释
        },
      });
      jseCode = result.code
    }
    if (type == '02') {
      newloading = true
      const jshamanHeader = {
        'Connection': 'keep-alive',
        'Origin': 'http://www.jshaman.com',
        'Referer': 'http://www.jshaman.com/',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      }
      try {
        const res = await axios.post('https://www.jshaman.com:4430/submit_js_code/', {
          js_code: editor.document.getText(),
          vip_code: 'free'
        }, { headers: jshamanHeader })
        jseCode = res.data.content
      } catch(err) {
        vscode.window.showInformationMessage('加密失败');
        console.log(err)
        return;
      } finally {
        newloading = false
      }
    }
    // 调用 packer 压缩
    // jseCode = packer.pack(jseCode, true, true)
    // 获取写入文件路径
    const outputPath = join(dirname(editor.document.fileName), `${parse(basename(editor.document.fileName)).name}${generateIdentifier}.js`).replace(identificationIdentifier, '');
    // 写入文件
    fs.writeFileSync(outputPath, jseCode, 'utf-8');
    // 计算写入文件大小并输出提示
    vscode.window.showInformationMessage('JSE run done. size: ' + parseFloat((fs.statSync(outputPath).size / 1024).toFixed(2)) + 'kb');
  } else {
    vscode.window.showInformationMessage('没有活动的编辑器 或者 不是javascript');
  }
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const saveBtn = createStatusBarItem('JSEAuto: ON', '保存时自动加密', 'jse.save')
  createStatusBarItem('JSE1', '加密方式一', 'jse.01')
  createStatusBarItem('JSE2', '加密方式二', 'jse.02')
  // 注册命令-加密方式一
  const jsesave = vscode.commands.registerCommand('jse.save', async () => {
    saveBtn.text = saveBtn.text == 'JSEAuto: ON' ? 'JSEAuto: OFF' : 'JSEAuto: ON'
    console.log(saveBtn.text)
    // jsTerser(context, '01')
  });
  // 注册命令-加密方式一
  const jse1 = vscode.commands.registerCommand('jse.01', async () => {
    jsTerser(context, '01', true)
  });
  // 注册命令-加密方式二
  const jse2 = vscode.commands.registerCommand('jse.02', async () => {
    jsTerser(context, '02', true)
  });
  // 注册命令-下拉选项
  const disposable = vscode.commands.registerCommand('extension.showOptions', async () => {
    const options = ['选项一', '选项二'];
    const selection = await vscode.window.showQuickPick(options, {
        placeHolder: '请选择一个选项',
    });

    if (selection === '选项一') {
        vscode.window.showInformationMessage('你选择了选项一');
        // 在这里触发选项一的事件
    } else if (selection === '选项二') {
        vscode.window.showInformationMessage('你选择了选项二');
        // 在这里触发选项二的事件
    }
  });
  // 文件保存时触发
  let dispJs = vscode.workspace.onDidSaveTextDocument(async () => {
    if (saveBtn.text == 'JSEAuto: ON') jsTerser(context, '01', false)
  });
  context.subscriptions.push(dispJs, jsesave, jse1, jse2);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = { activate, deactivate };
