import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const API_KEY = process.env.ASI_ONE_API_KEY;
const ENDPOINT = "https://api.asi1.ai/v1/chat/completions";
const MODEL = "asi1-fast-agentic";

// Session management
const sessionMap = new Map();

function getSessionId(convId) {
  let sessionId = sessionMap.get(convId);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionMap.set(convId, sessionId);
  }
  return sessionId;
}

async function ask(convId, messages, stream = false) {
  if (!API_KEY) {
    throw new Error("ASI_ONE_API_KEY is not set in the environment.");
  }

  const sessionId = getSessionId(convId);
  console.log(
    `[session] Using session-id: ${sessionId} at ${new Date().toISOString()}`
  );

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "x-session-id": sessionId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: MODEL, messages, stream }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!stream) {
    const result = await response.json();
    return result.choices[0].message.content;
  }

  // Handle streaming response
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") {
          console.log("\nStreaming complete.");
          return fullText;
        }
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            process.stdout.write(content);
            fullText += content;
          }
        } catch (e) {
          console.warn(`Malformed event ignored: ${e.message}`);
        }
      }
    }
  }

  console.log();
  return fullText;
}

// Usage example
const convId = uuidv4();
const messages = [
  {
    role: "user",
    content:
      "use Hi-dream model to generate image of monkey sitting on top of mountain",
  },
];

ask(convId, messages, true)
  .then((reply) => console.log(`Assistant: ${reply}`))
  .catch((err) => console.error(`Error: ${err.message}`));
