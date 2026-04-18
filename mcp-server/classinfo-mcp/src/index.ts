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

server.registerResource(
  'Refund Policy',
  'policy://refund',
  {
    title: 'Refund Policy',
    description: 'Refund Policy',
    mimeType: 'text/plain',
  },
  async () => {
    return {
      contents: [
        {
          uri: 'policy://refund',
          text: `Refund Policy

Last Updated: January 1, 2026

Thank you for your purchase. This Refund Policy outlines the terms and conditions under which refunds may be granted.

1. Eligibility for Refunds
Customers may request a refund within 7 (seven) calendar days from the date of purchase. To be eligible, the product or service must not be fully used, consumed, or accessed. Proof of purchase is required for all refund requests.

2. Non-Refundable Items and Services
The following are not eligible for refunds:
- Digital products once they have been accessed, downloaded, or activated
- Services that have already been fully or partially delivered
- Subscription fees for periods already used
- Promotional, discounted, or clearance items (unless otherwise stated)
- Customized or personalized products

3. Refund Request Process
To initiate a refund, customers must:
- Contact our support team via email at support@example.com
- Provide a valid order ID and purchase details
- Clearly state the reason for the refund request

All requests will be reviewed, and additional information may be requested to process the claim.

4. Approval and Rejection
Refund requests are evaluated on a case-by-case basis. We reserve the right to approve or reject any request based on eligibility criteria, usage, and evidence provided. If a request is rejected, a clear explanation will be communicated.

5. Processing Time
Once approved, refunds will be processed within 5–10 business days. The time it takes for the refund to reflect in your account may vary depending on your payment provider or financial institution.

6. Refund Method
Refunds will be issued to the original payment method used during the purchase. In exceptional cases, alternative methods may be provided at our discretion.

7. Late or Missing Refunds
If you have not received your refund within the expected timeframe:
- Check your bank account again
- Contact your credit card provider or bank
- If the issue persists, contact us at support@example.com

8. Cancellations
Orders or services may be canceled before they are processed or delivered. Once processing or delivery has begun, cancellation may not be possible.

9. Exchanges
We only replace items if they are defective or damaged. If you need to request an exchange, please contact support@example.com with relevant details and evidence.

10. Abuse of Policy
We reserve the right to deny refunds if we detect misuse, abuse, or fraudulent activity related to refund requests.

11. Changes to This Policy
We may update this Refund Policy from time to time. Changes will be effective immediately upon posting. Continued use of our services indicates acceptance of the updated policy.

12. Contact Information
If you have any questions about this Refund Policy, please contact us:

Email: support@example.com`,
        },
      ],
    };
  },
);

server.registerPrompt(
  'get_student_list',
  {
    title: 'Student list',
    description: 'Give a list of students based on the provided limit',
    argsSchema: {
      limit: z.string().describe('The number of students'),
    },
  },
  async ({ limit }): Promise<GetPromptResult> => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `give me list of enrolled students with limit ${limit}`,
          },
        },
      ],
    };
  },
);

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
