<div align="center">

# 🧠 Local MCP Agent  
**Offline AI Agent Lab using Model Context Protocol + Ollama**

<sub>Local inference • Tool-based agents • No cloud dependencies</sub>

</div>

---

## ✨ Overview

This project implements a **fully local AI agent platform** using **Model Context Protocol (MCP)** and **Ollama**.  
The agent runs **entirely on-device**, performs **offline LLM inference**, and interacts with the system only through **explicitly defined tools**.

The goal of this lab is to explore **modern agent architectures**, **tool orchestration**, and **infrastructure tradeoffs** in environments where cloud access is restricted or unavailable.

---

## 🧩 Architecture

```
Client (Node.js)
   │
   │  MCP (stdio)
   ▼
MCP Server (Node.js)
   │
   ├── read_file → Local filesystem
   │
   └── ask_model → Ollama (localhost)
                    │
                    └── Local LLM (CPU inference)
```

All communication occurs over `localhost` or stdio.  
No external APIs are used at runtime.

---

## 🔧 Components

### 🧠 Ollama (Local LLM Runtime)
- Runs open-weight language models locally
- Exposes a local HTTP API (`localhost:11434`)
- Fully offline after initial model download

**Models tested**
- `qwen3:4b` (higher quality, slower on CPU)
- `llama3.2:3b`, `phi-3` (recommended for fast demos)

---

### 🛰 MCP Server
The MCP server acts as the **control plane** for the agent:

- Advertises available tools
- Executes tool calls on behalf of the model
- Enforces strict capability boundaries
- Separates reasoning from execution

---

### 🛠 Tools

#### `read_file`
Reads a UTF-8 text file from the local filesystem.

Used to demonstrate:
- Controlled resource access
- Data ingestion via explicit tools

#### `ask_model`
Sends a prompt to the local LLM via Ollama and returns the response.

Used to demonstrate:
- Local inference
- Model latency tradeoffs
- CPU-bound generation constraints

---

### 🧪 MCP Client
A minimal Node.js client validates the full agent loop:

1. Starts the MCP server as a subprocess  
2. Connects via stdio  
3. Discovers available tools  
4. Reads a local file  
5. Feeds content to the LLM  
6. Outputs the model response  

---

## 🔄 Execution Flow

1. Ollama loads model weights from disk  
2. MCP server starts and registers tools  
3. Client connects via MCP stdio transport  
4. Tools are discovered dynamically  
5. Local file is read using `read_file`  
6. File contents are sent to the LLM via `ask_model`  
7. Model generates a response locally  
8. Result is returned to the client  

---

## ⚡ Performance Notes

- CPU-only inference can be slow for mid-sized models
- Larger models may exceed default client timeouts
- Smaller models are recommended for interactive demos

These limitations intentionally surface **real infrastructure tradeoffs**.

---

## 🧱 Requirements

- Node.js 18+
- Ollama
- CPU-only supported (GPU optional)

---

## ▶️ Running the Lab

Install dependencies:
```bash
npm install
```

Pull a fast local model:
```bash
ollama pull llama3.2:3b
```

Run the client:
```bash
node client.js
```

---

## 🔐 Security Model

- No outbound network access required
- Tools are explicitly defined
- No arbitrary command execution
- Suitable for offline or air-gapped environments

---

## 🎯 Why This Project Exists

This lab explores **agent-style AI architectures** using:
- Local inference
- Explicit tool boundaries
- Secure orchestration patterns

It is intended as a **platform / infrastructure experiment**, not a consumer AI application.

---

## 🚀 Future Improvements

- VM-isolated deployment
- Tool permission policies
- Token and rate limiting
- Multi-agent orchestration
- Dockerized runtime
- Structured logging and metrics

---

## 📜 License

MIT
