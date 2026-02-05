import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // Start the MCP server as a subprocess
  const transport = new StdioClientTransport({
    command: "node",
    args: ["server.js"],
  });

  const client = new Client(
    { name: "local-mcp-client", version: "0.1.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("✅ Connected to MCP server");

  // 1) List tools
  const tools = await client.listTools(undefined, { timeout: 180000 });
  console.log("🧰 Tools:", tools.tools.map((t) => t.name));

  // 2) Call read_file
  const readRes = await client.callTool(
    {
      name: "read_file",
      arguments: { file_path: "./test.txt" },
    },
    undefined,
    { timeout: 180000 }
  );

  const fileJson = readRes.content?.[0]?.text ?? "";
  console.log("📄 read_file result:", fileJson);

  // 3) Ask model to summarize the file
  const prompt = `Summarize this text in 1-2 sentences:\n\n${fileJson}`;
  const modelRes = await client.callTool(
    {
      name: "ask_model",
      arguments: { prompt },
    },
    undefined,
    { timeout: 180000 }
  );

  const answer = modelRes.content?.[0]?.text ?? "";
  console.log("\n🤖 Model answer:\n", answer);

  await client.close();
}

main().catch((err) => {
  console.error("❌ Client error:", err);
  process.exit(1);
});
