import { Extension } from '@codemirror/state';
import { CompletionSource } from '@codemirror/autocomplete';
import { html, htmlCompletionSource } from '@codemirror/lang-html';
import { css, cssCompletionSource } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { less } from '@codemirror/lang-less';
import { vue } from '@codemirror/lang-vue';
import { htmlCustomSnippetSource } from '../autocompleteService';

export type EditorLanguage =
  | 'html'
  | 'css' | 'scss' | 'less'
  | 'js' | 'react' | 'vue' | 'ts';

export interface LanguageConfig {
  id: EditorLanguage;
  cmLanguage: () => Extension;
  baseCompletionSources: CompletionSource[];
  snippetLanguageId: string;
  enableLSP: boolean;
}

const cssBaseSources: CompletionSource[] = [cssCompletionSource];
const htmlCustomCompletionSource: CompletionSource = () => ({
  from: 0,
  options: [htmlCustomSnippetSource],
  validFor: /\w*/,
});
const htmlBaseSources: CompletionSource[] = [htmlCompletionSource, htmlCustomCompletionSource];
const jsBaseSources: CompletionSource[] = [];

export const languageRegistry = new Map<EditorLanguage, LanguageConfig>([
  [
    'html',
    {
      id: 'html',
      cmLanguage: html,
      baseCompletionSources: htmlBaseSources,
      snippetLanguageId: 'html',
      enableLSP: false,
    },
  ],
  [
    'css',
    {
      id: 'css',
      cmLanguage: css,
      baseCompletionSources: cssBaseSources,
      snippetLanguageId: 'css',
      enableLSP: false,
    },
  ],
  [
    'scss',
    {
      id: 'scss',
      // CodeMirror 没有独立的 scss 包，先用 css 语法高亮，补全源走 cssCompletionSource
      cmLanguage: css,
      baseCompletionSources: cssBaseSources,
      snippetLanguageId: 'css',
      enableLSP: false,
    },
  ],
  [
    'less',
    {
      id: 'less',
      cmLanguage: less,
      baseCompletionSources: cssBaseSources,
      snippetLanguageId: 'css',
      enableLSP: false,
    },
  ],
  [
    'js',
    {
      id: 'js',
      cmLanguage: () => javascript(),
      baseCompletionSources: jsBaseSources,
      snippetLanguageId: 'js',
      enableLSP: true,
    },
  ],
  [
    'react',
    {
      id: 'react',
      cmLanguage: () => javascript({ jsx: true, typescript: true }),
      baseCompletionSources: jsBaseSources,
      snippetLanguageId: 'react',
      enableLSP: true,
    },
  ],
  [
    'vue',
    {
      id: 'vue',
      cmLanguage: vue,
      baseCompletionSources: jsBaseSources,
      snippetLanguageId: 'vue',
      enableLSP: true,
    },
  ],
  [
    'ts',
    {
      id: 'ts',
      cmLanguage: () => javascript({ typescript: true }),
      baseCompletionSources: jsBaseSources,
      snippetLanguageId: 'ts',
      enableLSP: true,
    },
  ],
]);
