# Vue 图片尺寸自动补全

这个 VSCode 扩展可以自动为 Vue 文件中的 `<a-img>` 和 `<fac-img>` 标签添加宽高属性。

# 演示

![演示](https://github.com/xao-ming/Vue-Image-Dimensions/blob/main/view.gif?raw=truef)

## 功能

- 当光标位于 `<a-img>` 或 `<fac-img>` 标签内时，标签会被高亮显示，并提示可以按 Tab 键添加宽高
- 按下 Tab 键后，扩展会自动读取图片文件的实际尺寸，并添加 `w` 和 `h` 属性
- 支持多种常见的图片路径解析方式

## 使用方法

1. 在 Vue 文件中 `<a-img src="图片路径" />` 或 `<fac-img src="图片路径" /> ` 将光标放在标签内
2. 按下 Tab 键
3. 扩展会自动将标签更新为 `<a-img src="图片路径" w="宽度" h="高度" />` 或 `<fac-img src="图片路径" w="宽度" h="高度" />`

## 注意事项

- 图片文件必须存在于 `src/assets` 目录下
- 扩展会尝试在多个常见位置查找图片文件
- 如果找不到图片或无法读取尺寸，会显示错误消息
