import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import axios from "axios";
import fs from "fs";
import path from "path";

const MODEL = "qwen3:4b";

/**
 * Create MCP server
 */
const server = new Server(
  { name: "local-mcp-agent", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_file",
        description: "Read a local UTF-8 text file",
        inputSchema: {
          type: "object",
          properties: {
            file_path: {
              type: "string",
              description: "Path to the local file",
            },
          },
          required: ["file_path"],
        },
      },
      {
        name: "ask_model",
        description: "Send a prompt to the local Ollama model",
        inputSchema: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "Prompt for the model",
            },
          },
          required: ["prompt"],
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const args = request.params.arguments ?? {};

  try {
    if (toolName === "read_file") {
      const resolvedPath = path.resolve(args.file_path);
      const fileContent = fs.readFileSync(resolvedPath, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                file_path: resolvedPath,
                content: fileContent,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (toolName === "ask_model") {
      const response = await axios.post(
        "http://localhost:11434/api/generate",
        {
          model: MODEL,
          prompt: args.prompt,
          stream: false,
        }
      );

      return {
        content: [
          {
            type: "text",
            text: response.data.response ?? "",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Unknown tool: ${toolName}`,
        },
      ],
      isError: true,
    };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `Tool execution error: ${err?.message ?? err}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start server on stdio
 */
const transport = new StdioServerTransport();
await server.connect(transport);

console.error(`✅ MCP server running on stdio (model=${MODEL})`);
