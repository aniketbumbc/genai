# GenAI Engineering Lab

A practical, multi-project GenAI playground focused on production-relevant agent patterns: RAG, tool calling, multi-agent orchestration, MCP integration, streaming UX, and domain assistants.

This repository is designed as an **applied AI engineering portfolio**. Each folder demonstrates a concrete architecture pattern that can be reused in internal copilots, workflow automation, and customer-facing AI products.

## Why This Repo Matters

- Demonstrates breadth: from simple function-calling agents to supervisor-based multi-agent systems.
- Demonstrates depth: retrieval pipelines, memory, external tools, SSE streaming, and MCP protocol integration.
- Encourages modular experimentation: each project is independently runnable and can be evolved into a production service.
- Useful for technical leadership reviews: clear examples of system design trade-offs and implementation choices.

## Monorepo At A Glance

| Project                          | Project Summary                                                                                       | Tech Stack                                                         | How To Start                                                                  | Primary Use / Business Value                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `rag system/comapy-bot`          | RAG prototype that indexes PDF docs and prepares vector search workflow with Pinecone.                | Node.js, LangChain, OpenAI, Pinecone, `pdf-parse`, dotenv          | `cd "rag system/comapy-bot" && npm install && node ragServer.js`              | Enterprise knowledge retrieval over internal documents (policy, HR, operations).        |
| `collage-student-support-agent`  | Student support assistant using LangGraph + RAG-style indexing and tool-driven reasoning.             | Node.js, LangChain, LangGraph, OpenAI, Pinecone, `pdf-parse`, Zod  | `cd collage-student-support-agent && npm install && npm run dev`              | Academic FAQ automation, student onboarding, and support desk deflection.               |
| `research-agent`                 | Interactive CLI research assistant that reasons over queries and returns structured answers.          | Node.js, LangGraph, OpenAI, Tavily, Zod, dotenv                    | `cd research-agent && npm install && node index.js`                           | Fast analyst workflows for market/competitor research and brief generation.             |
| `langraph-agent`                 | ReAct-style personal assistant agent with Tavily + custom tools (calendar and utility actions).       | Node.js, LangChain, LangGraph, OpenAI, Tavily, Zod                 | `cd langraph-agent && npm install && node langraphAgent.js`                   | Agent orchestration pattern for task automation and tool delegation.                    |
| `supervisor-multiagent`          | Supervisor architecture coordinating specialist agents with interrupt/approval loop support.          | Node.js, LangGraph, LangChain, OpenAI, Zod                         | `cd supervisor-multiagent && npm install && npm run dev`                      | Human-in-the-loop AI ops for sensitive workflows (email approvals, controlled actions). |
| `google-assistance`              | Google calendar/email-oriented assistant using LangGraph with tool binding and thread memory.         | Node.js + TypeScript, LangGraph, OpenAI, Google APIs, Express, Zod | `cd google-assistance && npm install && npm run dev`                          | Meeting scheduling automation and personal productivity assistant scenarios.            |
| `linkedin-writer`                | Content-generation agent focused on drafting LinkedIn posts from user prompts.                        | Node.js, LangGraph, OpenAI, LangChain Core                         | `cd linkedin-writer && npm install && node index.js`                          | Personal branding automation and creator workflow acceleration.                         |
| `finance-agent`                  | Finance assistant with OpenAI function-calling for income/expense logging and balance analytics.      | Node.js, OpenAI SDK, dotenv                                        | `cd finance-agent && npm install && node agent.js`                            | Personal finance copilots, budgeting assistants, and transaction summarization POCs.    |
| `websearch-agent`                | Express-backed chatbot with web lookup capabilities and thread-aware chat endpoint.                   | Node.js, Express, CORS, OpenAI, Groq SDK, Tavily                   | `cd websearch-agent && npm install && node server.js`                         | Real-time query answering APIs for support bots and assistant backends.                 |
| `frontend/chatBot`               | Lightweight React chat UI frontend intended to connect with chatbot APIs.                             | React 19, Vite 7, ESLint                                           | `cd frontend/chatBot && npm install && npm run dev`                           | UI shell for rapid validation of chat flows and message UX.                             |
| `generative-ui/server`           | SSE backend that streams AI/tool events for an expense-tracker assistant and chart generation.        | Node.js + TypeScript, Express, LangGraph, OpenAI, Zod, SQLite      | `cd generative-ui/server && pnpm install && pnpm dev`                         | Pattern for real-time, tool-aware AI APIs with streaming responses.                     |
| `generative-ui/chat-ui`          | Modern streaming chat interface rendering tool outputs (including charts) in a generative UI pattern. | React 19, TypeScript, Vite 7, Tailwind v4, Recharts, SSE client    | `cd generative-ui/chat-ui && npm install && npm run dev`                      | Production-style conversational UI patterns for data-rich assistant products.           |
| `mcp-server/classinfo-mcp`       | MCP server exposing tools/resources/prompts for class/student information workflows.                  | TypeScript, MCP SDK, Hono, Zod                                     | `cd mcp-server/classinfo-mcp && pnpm install && pnpm run build && pnpm start` | Internal platform integration pattern using standardized MCP interfaces.                |
| `mcp-server/mcp-client`          | MCP client that connects LLM tool-calling flow to MCP servers (local or remote).                      | TypeScript, MCP SDK, OpenAI SDK, dotenv                            | `cd mcp-server/mcp-client && pnpm install && pnpm run dev`                    | Blueprint for enterprise tool orchestration via MCP across AI applications.             |
| Repository root (`package.json`) | Utility script package for local automation experiments.                                              | Node.js, `@nut-tree/nut-js`                                        | `npm install && npm start`                                                    | Misc local automation support; not part of core GenAI app stack.                        |

## Suggested Startup Paths

| Goal                                     | Start These Modules                                        |
| ---------------------------------------- | ---------------------------------------------------------- |
| End-to-end streaming AI product demo     | `generative-ui/server` + `generative-ui/chat-ui`           |
| RAG and knowledge assistant demo         | `rag system/comapy-bot` or `collage-student-support-agent` |
| Multi-agent orchestration with approvals | `supervisor-multiagent`                                    |
| MCP protocol demonstration               | `mcp-server/classinfo-mcp` + `mcp-server/mcp-client`       |
| Fast web chatbot API demo                | `websearch-agent` + `frontend/chatBot`                     |

## Environment Variables

Most projects expect a local `.env` file. Typical keys used across modules:

- `OPENAI_API_KEY`
- `TAVILY_API_KEY`
- `PINECONE_API_KEY`
- Google API credentials (for `google-assistance`)

Keep `.env` files local and never commit secrets.

## Recommended Demo Flow (10-15 min)

1. Run `generative-ui/server` and `generative-ui/chat-ui` to show streaming + tool-generated chart output.
2. Run `supervisor-multiagent` to demonstrate controlled agent execution with approvals.
3. Run `mcp-server/classinfo-mcp` and `mcp-server/mcp-client` to show protocol-based tool interoperability.
4. Close with `rag system/comapy-bot` (or student support agent) to demonstrate retrieval over private docs.

This sequence communicates engineering maturity: **UX + orchestration + interoperability + enterprise knowledge workflows**.

## Notes

- Projects are intentionally independent for experimentation speed.
- Script names are not yet standardized (`node <file>` vs `npm run dev` vs `pnpm dev`).
- Several modules are prototypes; hardening items for production include auth, observability, test coverage, and deployment pipelines.
