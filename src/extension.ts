import * as vscode from 'vscode';
import { setupImageDimensionsFeature } from './features';

export function activate(context: vscode.ExtensionContext) {
    console.log('Vue Image Dimensions 插件已激活');

    // 设置图片尺寸功能
    setupImageDimensionsFeature(context);
}

export function deactivate() {
    // 清理资源
} 