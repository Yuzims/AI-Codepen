import { bracketMatching } from '@codemirror/language';
import { completionKeymap, closeBracketsKeymap, snippetCompletion } from '@codemirror/autocomplete';
import { keymap } from '@codemirror/view';

// 仅保留项目中特有的 HTML 自定义 snippet（CodeMirror 官方语言包不提供的）
export const htmlCustomSnippetSource = snippetCompletion(
  '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t${2}\n</body>\n</html>',
  { label: 'html5', type: 'snippet' }
);

// 导出括号高亮匹配扩展
export const bracketMatchingExtension = bracketMatching();

// 自动括号补全扩展
export const closeBracketsExtension = keymap.of([
  {
    key: '(',
    run: (view) => {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: [{ from, insert: '()' }],
        selection: { anchor: from + 1, head: from + 1 }
      });
      return true;
    }
  },
  {
    key: '[',
    run: (view) => {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: [{ from, insert: '[]' }],
        selection: { anchor: from + 1, head: from + 1 }
      });
      return true;
    }
  },
  {
    key: '{',
    run: (view) => {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: [{ from, insert: '{}' }],
        selection: { anchor: from + 1, head: from + 1 }
      });
      return true;
    }
  }
]);

// 导出所有 keymap 供编辑器使用
export { completionKeymap, closeBracketsKeymap };
