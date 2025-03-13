import * as vscode from 'vscode';
import { handleAddImageDimensions } from './commands';
import { initDecorator, updateDecorations, disposeDecorator } from './decorator';

// 装饰类型
let decorationType: vscode.TextEditorDecorationType;

/**
 * 设置图片尺寸功能
 */
export function setupImageDimensionsFeature(context: vscode.ExtensionContext): void {
    // 初始化装饰器
    decorationType = initDecorator();

    // 注册命令
    const disposable = vscode.commands.registerCommand(
        'vue-image-dimensions.addImageDimensions',
        handleAddImageDimensions
    );

    // 添加事件监听
    context.subscriptions.push(
        disposable,

        // 光标位置变化监听
        vscode.window.onDidChangeTextEditorSelection(event => {
            updateDecorations(event.textEditor);
        }),

        // 活动编辑器变化监听
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDecorations(editor);
            }
        }),

        // 鼠标移动监听
        vscode.window.onDidChangeTextEditorVisibleRanges(event => {
            updateDecorations(event.textEditor);
        }),

        // 注册清理函数
        { dispose: disposeDecorator }
    );

    // 初始化装饰
    if (vscode.window.activeTextEditor) {
        updateDecorations(vscode.window.activeTextEditor);
    }
} 