jest.mock('@codemirror/autocomplete', () => ({
  snippetCompletion: jest.fn((body: string, opts: any) => ({ body, ...opts })),
}));

export {};

describe('snippetLoader', () => {
  describe('loadSnippets', () => {
    it('should return snippets for html', async () => {
      const { loadSnippets } = await import('../snippetLoader');
      const snippets = await loadSnippets('html');
      expect(snippets.length).toBeGreaterThan(0);
      expect(snippets[0]).toHaveProperty('label');
    });

    it('should return empty array for unknown language', async () => {
      const { loadSnippets } = await import('../snippetLoader');
      const snippets = await loadSnippets('unknown-language');
      expect(snippets).toEqual([]);
    });
  });

  describe('createSnippetCompletionSource', () => {
    it('should return cached snippets on second call', async () => {
      const { createSnippetCompletionSource } = await import('../snippetLoader');
      const source = createSnippetCompletionSource('html');
      const first = await source();
      const second = await source();
      expect(first).not.toBeNull();
      // CompletionSource returns a fresh wrapper object, but the options array is cached
      expect((second as any).options).toBe((first as any).options);
    });
  });
});
