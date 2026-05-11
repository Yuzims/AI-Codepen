import { autocompletion, CompletionSource } from '@codemirror/autocomplete';
import { EditorLanguage, languageRegistry } from './languageRegistry';
import { createSnippetCompletionSource } from './snippetLoader';
import { createTsCompletionSource } from './tsWorkerAdapter';
import { perf } from '../perfSDK';

function wrapWithTiming<T extends CompletionSource>(source: T, metricName: 'completion_snippet_ms' | 'completion_ts_worker_ms'): CompletionSource {
  return async (context) => {
    const start = performance.now();
    const result = await source(context);
    perf.record(metricName, performance.now() - start);
    return result;
  };
}

export interface TSOptions {
  fileName: string;
  language: 'js' | 'ts' | 'tsx';
}

/**
 * 为指定语言构建完整的 CodeMirror 补全配置。
 * 组合顺序：
 * 1. 语言包原生补全 (baseCompletionSources)
 * 2. Snippet 补全 (动态 JSON 加载)
 * 3. LSP 语义补全 (Phase 3 接入)
 */
export function createAutocompleteConfig(languageId: EditorLanguage, tsOptions?: TSOptions) {
  const config = languageRegistry.get(languageId);
  if (!config) {
    return autocompletion({
      override: [],
      defaultKeymap: true,
      maxRenderedOptions: 50,
      activateOnTyping: true,
    });
  }

  const sources: CompletionSource[] = [
    ...config.baseCompletionSources,
    wrapWithTiming(createSnippetCompletionSource(config.snippetLanguageId), 'completion_snippet_ms'),
  ];

  if (config.enableLSP && tsOptions) {
    sources.push(wrapWithTiming(createTsCompletionSource(tsOptions.fileName, tsOptions.language), 'completion_ts_worker_ms'));
  }

  return autocompletion({
    override: sources,
    defaultKeymap: true,
    maxRenderedOptions: 50,
    activateOnTyping: true,
  });
}

/**
 * 直接返回 CompletionSource 数组，供需要手动组合的场景使用。
 */
export function getCompletionSources(languageId: EditorLanguage): CompletionSource[] {
  const config = languageRegistry.get(languageId);
  if (!config) return [];

  return [
    ...config.baseCompletionSources,
    createSnippetCompletionSource(config.snippetLanguageId),
  ];
}
