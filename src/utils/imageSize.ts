import * as fs from 'fs';
import * as path from 'path';

interface ImageDimensions {
  width: number;
  height: number;
}

type DimensionsGetter = (buffer: Buffer) => ImageDimensions;

const getPngDimensions = (buffer: Buffer): ImageDimensions => ({
  width: buffer.readUInt32BE(16),
  height: buffer.readUInt32BE(20)
});

const getJpegDimensions = (buffer: Buffer): ImageDimensions => {
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xFF) {
      throw new Error('无效的 JPEG 格式');
    }

    const [marker, size] = [
      buffer[offset + 1],
      buffer.readUInt16BE(offset + 2)
    ];

    if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8) {
      return {
        width: buffer.readUInt16BE(offset + 7),
        height: buffer.readUInt16BE(offset + 5)
      };
    }

    offset += 2 + size;
  }

  throw new Error('无法获取 JPEG 格式图片尺寸');
};

const getImageSize = (imagePath: string): ImageDimensions | null => {
  try {
    const buffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();

    const dimensionsMap: Record<string, DimensionsGetter> = {
      '.png': getPngDimensions,
      '.jpg': getJpegDimensions,
      '.jpeg': getJpegDimensions
    };

    const getDimensions = dimensionsMap[ext];
    if (!getDimensions) {
      throw new Error('不支持的图片格式：仅支持 PNG 和 JPEG');
    }

    const dimensions = getDimensions(buffer);

    if (!dimensions?.width || !dimensions?.height) {
      throw new Error('无法获取图片尺寸');
    }

    return dimensions;
  } catch (error) {
    console.error('获取图片尺寸失败:', error instanceof Error ? error.message : String(error));
    return null;
  }
};

export default getImageSize;
