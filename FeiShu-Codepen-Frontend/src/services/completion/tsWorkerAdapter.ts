import { Completion, CompletionContext, CompletionResult, CompletionSource } from '@codemirror/autocomplete';

let worker: Worker | null = null;
let requestId = 0;
const pending = new Map<
  number,
  (value: Array<{ name: string; kind: string; kindModifiers?: string; detail?: string }>) => void
>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../../workers/tsWorker.ts', import.meta.url));
    worker.onmessage = (event) => {
      const { type, requestId: id, entries } = event.data;
      if (type === 'completionsResult') {
        const resolve = pending.get(id);
        if (resolve) {
          resolve(entries);
          pending.delete(id);
        }
      }
    };
  }
  return worker;
}

export async function requestTsCompletions(
  code: string,
  fileName: string,
  position: number,
  language: 'js' | 'ts' | 'tsx',
  triggerCharacter?: string
): Promise<Completion[]> {
  const w = getWorker();
  const id = ++requestId;
  return new Promise((resolve) => {
    pending.set(id, (entries) => {
      resolve(
        entries.map((e) => ({
          label: e.name,
          type: mapTsKindToCmType(e.kind),
          detail: e.detail || e.kind,
        }))
      );
    });
    w.postMessage({ type: 'getCompletions', requestId: id, code, fileName, position, language, triggerCharacter });
  });
}

export function createTsCompletionSource(
  fileName: string,
  language: 'js' | 'ts' | 'tsx'
): CompletionSource {
  return async (context: CompletionContext): Promise<CompletionResult | null> => {
    const { state, pos } = context;
    const code = state.doc.toString();
    const charBefore = pos > 0 ? state.doc.sliceString(pos - 1, pos) : '';
    const isDotTrigger = charBefore === '.';

    const word = context.matchBefore(/[\w$]*$/);
    const from = word ? word.from : pos;

    const completions = await requestTsCompletions(
      code,
      fileName,
      pos,
      language,
      isDotTrigger ? '.' : undefined
    );
    if (!completions.length) return null;

    return {
      from,
      options: completions,
      validFor: /^[\w$]*$/,
    };
  };
}

function mapTsKindToCmType(kind: string): string {
  switch (kind) {
    case 'function':
      return 'function';
    case 'method':
      return 'method';
    case 'class':
      return 'class';
    case 'interface':
    case 'type':
      return 'type';
    case 'variable':
      return 'variable';
    case 'property':
      return 'property';
    case 'enum':
      return 'enum';
    case 'module':
      return 'namespace';
    case 'keyword':
      return 'keyword';
    case 'text':
      return 'text';
    default:
      return 'property';
  }
}
