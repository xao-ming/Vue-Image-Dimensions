import * as vscode from 'vscode';
import { hasWidthHeightAttributes, IMG_TAG_REGEX_GLOBAL } from './imageDimensions';
import { debounce } from './utils';

// 装饰类型
let decorationType: vscode.TextEditorDecorationType;

/**
 * 初始化装饰器
 */
export function initDecorator(): vscode.TextEditorDecorationType {
    decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 255, 0, 0.2)',
        border: '1px dashed yellow',
        after: {
            contentText: ' 按Tab添加宽高',
            color: 'rgba(255, 165, 0, 0.8)',
            fontStyle: 'italic'
        }
    });

    return decorationType;
}

/**
 * 更新装饰的实际实现
 */
function _updateDecorations(editor: vscode.TextEditor | undefined): void {
    if (!editor || editor.document.languageId !== 'vue' || !decorationType) {
        return;
    }

    // 清除所有装饰
    editor.setDecorations(decorationType, []);

    // 只有当光标在图片标签内时才添加装饰
    const document = editor.document;
    const position = editor.selection.active;
    const line = document.lineAt(position.line).text;

    // 分别检查两种标签
    checkAndDecorateTag(editor, position, line, 'a-img');
    checkAndDecorateTag(editor, position, line, 'fac-img');
}

function checkAndDecorateTag(
    editor: vscode.TextEditor,
    position: vscode.Position,
    line: string,
    tagName: string
): void {
    const regex = new RegExp(`<${tagName}\\s+([^>]*)src=["']([^"']+)["']([^>]*)>`, 'g');
    let match;

    while ((match = regex.exec(line)) !== null) {
        // 检查光标是否在标签范围内
        const startPos = match.index;
        const endPos = match.index + match[0].length;

        if (position.character >= startPos && position.character <= endPos) {
            // 检查是否已有宽高属性
            if (!hasWidthHeightAttributes(match[0])) {
                const decoration: vscode.DecorationOptions = {
                    range: new vscode.Range(
                        new vscode.Position(position.line, startPos),
                        new vscode.Position(position.line, endPos)
                    ),
                    hoverMessage: `按 Tab 键自动添加 ${tagName} 图片宽高属性`
                };

                editor.setDecorations(decorationType, [decoration]);
            }
            break;
        }
    }
}

/**
 * 带防抖的更新装饰函数
 */
export const updateDecorations = debounce(_updateDecorations, 100);

/**
 * 清理装饰器
 */
export function disposeDecorator(): void {
    if (decorationType) {
        decorationType.dispose();
    }
} 