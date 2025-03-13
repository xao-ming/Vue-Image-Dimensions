import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import sizeOf from 'image-size';
import getImageSize from '../utils/imageSize';
// 更简单的正则表达式，可能更可靠
export const IMG_TAG_REGEX = /<(a-img|fac-img)([^>]*)src=["']([^"']+)["']([^>]*)>/;
export const IMG_TAG_REGEX_GLOBAL = new RegExp(IMG_TAG_REGEX.source, 'g');

export interface ImageDimensions {
    width: number;
    height: number;
}

/**
 * 查找图片文件并获取其尺寸
 */
export async function getImageDimensions(imagePath: string, documentUri: vscode.Uri): Promise<ImageDimensions> {
    // 获取图片的完整路径
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri)?.uri.fsPath;
    if (!workspaceFolder) {
        throw new Error('无法确定工作区文件夹');
    }

    // 在 src/assets 目录下递归搜索图片
    const assetsDir = path.join(workspaceFolder, 'src/assets');
    const fullImagePath = findFileInDirectory(assetsDir, imagePath);

    if (!fullImagePath) {
        throw new Error(`在 src/assets 目录下找不到图片文件: ${imagePath} ${assetsDir}`);
    }

    // 获取fullImagePath图片尺寸
    // const dimensions = sizeOf(fullImagePath);
    const dimensions = getImageSize(fullImagePath);
    // const imageBuffer = fs.readFileSync(fullImagePath);
    if (!dimensions || !dimensions.width || !dimensions.height) {
        throw new Error('无法获取图片尺寸');
    }

    return {
        width: dimensions.width,
        height: dimensions.height
    };
}

function findFileInDirectory(baseDir: string, targetFile: string): string | null {
    try {
        const files = fs.readdirSync(baseDir);

        for (const file of files) {
            const fullPath = path.join(baseDir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // 递归搜索子目录
                const found = findFileInDirectory(fullPath, targetFile);
                if (found) return found;
            } else if (file === targetFile) {
                // 找到目标文件
                return fullPath;
            }
        }
    } catch (error) {
        console.error('搜索目录时出错:', error);
    }
    return null;
}

// 替代方案：分别匹配两种标签
export function hasWidthHeightAttributes(text: string): boolean {
    return /w=["'][^"']*["']/.test(text) && /h=["'][^"']*["']/.test(text);
}

export function extractImagePath(text: string): string | null {
    // 尝试匹配 a-img
    let match = text.match(/<a-img([^>]*)src=["']([^"']+)["']([^>]*)>/);
    if (match) {
        return match[2];
    }

    // 尝试匹配 fac-img
    match = text.match(/<fac-img([^>]*)src=["']([^"']+)["']([^>]*)>/);
    if (match) {
        return match[2];
    }

    return null;
}

export function replaceTagWithDimensions(text: string, width: number, height: number): string {
    // 检查是哪种标签
    if (text.includes('<a-img')) {
        return text.replace(
            /<a-img([^>]*)src=["']([^"']+)["']([^>]*)>/,
            `<a-img src="$2" w="${width}" h="${height}" $3>`
        );
    } else if (text.includes('<fac-img')) {
        return text.replace(
            /<fac-img([^>]*)src=["']([^"']+)["']([^>]*)>/,
            `<fac-img src="$2" w="${width}" h="${height}" $3>`
        );
    }

    // 如果都不匹配，返回原文本
    return text;
} 