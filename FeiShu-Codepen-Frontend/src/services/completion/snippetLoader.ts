import { snippetCompletion } from '@codemirror/autocomplete';

export interface SnippetDefinition {
  prefix: string;
  body: string;
  description?: string;
}

/**
 * 异步加载指定语言的 snippet JSON 文件。
 * 文件路径约定: src/snippets/{languageId}.json
 */
export async function loadSnippets(
  languageId: string
): Promise<ReturnType<typeof snippetCompletion>[]> {
  try {
    const module = await import(`../../snippets/${languageId}.json`);
    const snippets: Record<string, SnippetDefinition> = module.default || module;

    return Object.entries(snippets).map(([name, data]) =>
      snippetCompletion(data.body, {
        label: data.prefix,
        detail: data.description || name,
        type: 'snippet',
      })
    );
  } catch {
    // JSON 不存在时静默返回空数组，不阻塞其他补全源
    return [];
  }
}

/**
 * 为 CodeMirror 创建一个异步 snippet CompletionSource。
 * 它会在补全触发时按需加载对应语言的 JSON 文件。
 */
export function createSnippetCompletionSource(languageId: string) {
  let cached: ReturnType<typeof snippetCompletion>[] | null = null;

  return async () => {
    if (cached) return { from: 0, options: cached, validFor: /\w*/ };
    cached = await loadSnippets(languageId);
    if (cached.length === 0) return null;
    return { from: 0, options: cached, validFor: /\w*/ };
  };
}
