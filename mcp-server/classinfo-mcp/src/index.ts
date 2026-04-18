import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
//import { json } from 'node:stream/consumers';
import { z } from 'zod';

import { GetPromptResult } from '@modelcontextprotocol/sdk/types.js';

// Create server instance
const server = new McpServer({
  name: 'classinfo',
  version: '1.0.0',
});

type GetClassInfoInput = {
  limit?: number;
};

const students = [
  {
    name: 'John Doe',
    enrollment: '123456',
    email: 'john.doe@example.com',
    city: 'New York',
  },
  {
    name: 'Jane Doe',
    enrollment: '123457',
    email: 'jane.doe@example.com',
    city: 'Los Angeles',
  },
  {
    name: 'Jim Doe',
    enrollment: '123458',
    email: 'jim.doe@example.com',
    city: 'Chicago',
  },
  {
    name: 'Jill Doe',
    enrollment: '123459',
    email: 'jill.doe@example.com',
    city: 'Houston',
  },
  {
    name: 'Mike Doe',
    enrollment: '123460',
    email: 'jack.doe@example.com',
    city: 'Miami',
  },
  {
    name: 'Jill Doe',
    enrollment: '123461',
    email: 'jill.doe@example.com',
    city: 'Houston',
  },
  {
    name: 'Buun Doe',
    enrollment: '123462',
    email: 'jack.doe@example.com',
    city: 'Miami',
  },
  {
    name: 'Jill Doe',
    enrollment: '123463',
    email: 'jill.doe@example.com',
    city: 'Houston',
  },
  {
    name: 'Nik Doe',
    enrollment: '123464',
    email: 'jack.doe@example.com',
    city: 'Miami',
  },
  {
    name: 'Jill Doe',
    enrollment: '123465',
    email: 'jill.doe@example.com',
    city: 'Houston',
  },
  {
    name: 'James Doe',
    enrollment: '123466',
    email: 'jack.doe@example.com',
    city: 'Miami',
  },
];

server.registerPrompt(
  'get_greeting',
  {
    title: 'Get a greeting',
    description: 'A simple greeting prompt template',
    argsSchema: {
      name: z.string().describe('The name of the person to greet'),
    },
  },
  async ({ name }): Promise<GetPromptResult> => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Hello, ${name}! welcome to the class for model context protocol`,
          },
        },
      ],
    };
  },
);

// @ts-ignore
server.registerTool(
  'get_class_info',
  {
    description:
      'Get list of all students in a class and enrollment information',
    inputSchema: {
      limit: z.number().optional().describe('The number of students to return'),
    },
  },
  async ({ limit }: GetClassInfoInput) => {
    const studentsToReturn = students.slice(0, limit);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(studentsToReturn),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Class Info MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
