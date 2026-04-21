import { OpenAI } from 'openai';
import { Tool } from 'openai/resources/responses/responses.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { FunctionTool } from 'openai/resources/beta.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import readline from 'readline/promises';
import dotenv from 'dotenv';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

class MCPClient {
  private mcp: Client;
  private openai: OpenAI;
  private transport:
    | StreamableHTTPClientTransport
    | StdioClientTransport
    | null = null;
  private tools: FunctionTool[] = [];

  constructor() {
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
    this.mcp = new Client({ name: 'classinfo-mcp-client', version: '1.0.0' });
  }
  // methods will go here

  async connectToServer(serverScriptPath: string) {
    try {
      const isJs = serverScriptPath.endsWith('.js');
      const isPy = serverScriptPath.endsWith('.py');
      if (!isJs && !isPy) {
        throw new Error('Server script must be a .js or .py file');
      }
      const command = isPy
        ? process.platform === 'win32'
          ? 'python'
          : 'python3'
        : process.execPath;

      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
      });

      await this.mcp.connect(this.transport);

      const toolsResult = await this.mcp.listTools();

      console.error('toolsResult', toolsResult);
      this.tools = toolsResult.tools.map((tool) => {
        return {
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.inputSchema,
          },
        };
      });
      console.log(
        'Connected to server with tools:',
        this.tools.map(({ function: { name } }) => name),
      );
    } catch (e) {
      console.log('Failed to connect to MCP server: ', e);
      throw e;
    }
  }

  async processQuery(query: string) {
    console.log('processQuery', query);
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content:
          'You are a helpful assistant that can use tools to answer questions. You are connected to a MCP server that can provide you with tools to use. You will always use the tools to answer the questions.',
      },
      {
        role: 'user',
        content: query,
      },
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools: this.tools,
    });

    //console.log('response', response.choices[0].message.content);

    const finalText = [];

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    if (assistantMessage.content) {
      finalText.push(assistantMessage.content);
    }
    //console.log('assistantMessage', assistantMessage);
    if (
      assistantMessage?.tool_calls &&
      assistantMessage?.tool_calls?.length > 0
    ) {
      messages.push({
        role: 'assistant',
        content: assistantMessage.content || '',
        tool_calls: assistantMessage.tool_calls || [],
      });
      //console.log(finalText);

      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type !== 'function') continue;
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments as string);
        finalText.push(
          `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`,
        );

        // this call mcp server to call the tool
        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs,
        });

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result.content),
        });
      }

      const finalResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
      });

      if (finalResponse.choices[0].message.content) {
        finalText.push(finalResponse.choices[0].message.content);
      }
    }
    return finalText.join('\n');
  }

  async chatLoop() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      console.log('\nMCP Client Started!');
      console.log("Type your queries or 'quit' to exit.");

      while (true) {
        const message = await rl.question('\nQuery: ');
        if (message.toLowerCase() === '/bye') {
          break;
        }

        const response = await this.processQuery(message);
        //console.log('\n' + response);
      }
    } finally {
      rl.close();
    }
  }

  async cleanup() {
    await this.mcp.close();
  }
}

async function main() {
  console.warn('main');
  console.warn('process.argv', process.argv);
  if (process.argv.length < 3) {
    console.warn('Usage: node index.ts <path_to_server_script>');
    return;
  }
  const mcpClient = new MCPClient();

  try {
    await mcpClient.connectToServer(process.argv[2]);
    await mcpClient.chatLoop();
  } catch (e) {
    console.error('Error:', e);
    await mcpClient.cleanup();
    process.exit(1);
  } finally {
    await mcpClient.cleanup();
    process.exit(0);
  }
}

main();
