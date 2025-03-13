import * as vscode from 'vscode';
import {
    getImageDimensions,
    hasWidthHeightAttributes,
    replaceTagWithDimensions,
    IMG_TAG_REGEX
} from './imageDimensions';

/**
 * 处理 Tab 键添加图片尺寸的命令
 */
export async function handleAddImageDimensions(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== 'vue') {
        return executeDefaultTabBehavior();
    }

    const document = editor.document;
    const position = editor.selection.active;
    const line = document.lineAt(position.line).text;

    console.log('处理命令，当前行:', line);

    // 检查光标是否在图片标签内
    const match = line.match(IMG_TAG_REGEX);

    if (match) {
        console.log('匹配到标签:', match[0], '标签类型:', match[1]);
    } else {
        console.log('未匹配到图片标签');
    }

    if (!match || hasWidthHeightAttributes(line)) {
        console.log('未匹配到标签或已有宽高属性，执行默认Tab行为');
        return executeDefaultTabBehavior();
    }

    const tagName = match[1];  // a-img 或 fac-img
    const srcAttribute = match[3];

    console.log('处理标签:', tagName, '图片路径:', srcAttribute);

    try {
        // 获取图片尺寸并应用
        const dimensions = await getImageDimensions(srcAttribute, document.uri);
        console.log('获取到图片尺寸:', dimensions);

        await applyImageDimensions(editor, position.line, line, dimensions);

        vscode.window.showInformationMessage(`已添加图片尺寸: ${dimensions.width}x${dimensions.height}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error('处理图片尺寸时出错:', error.message);
            vscode.window.showErrorMessage(`错误: ${error.message}`);
        }
        return executeDefaultTabBehavior();
    }
}

/**
 * 执行默认的 Tab 行为
 */
async function executeDefaultTabBehavior(): Promise<void> {
    await vscode.commands.executeCommand('tab');
}

/**
 * 应用图片尺寸到编辑器
 */
async function applyImageDimensions(
    editor: vscode.TextEditor,
    lineIndex: number,
    lineText: string,
    dimensions: { width: number, height: number }
): Promise<void> {
    const newText = replaceTagWithDimensions(lineText, dimensions.width, dimensions.height);

    await editor.edit(editBuilder => {
        editBuilder.replace(
            new vscode.Range(
                new vscode.Position(lineIndex, 0),
                new vscode.Position(lineIndex, lineText.length)
            ),
            newText
        );
    });
} 