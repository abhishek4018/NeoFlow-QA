import assert from 'node:assert';
import { describe, it } from 'node:test';

import { MCPBrowserExplorer } from '../../src/care/mcp-explorer';

describe('MCP Browser Explorer', () => {
  it('instantiates and initializes browser cleanly', async () => {
    const explorer = new MCPBrowserExplorer();
    assert.ok(explorer);
    await explorer.close();
  });
});
