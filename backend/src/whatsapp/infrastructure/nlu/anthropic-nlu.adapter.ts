import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { NluChatInput, NluEngine, NluResponse, NluTurn } from "../../domain/ports/nlu-engine";

const DEFAULT_MODEL = "claude-haiku-4-5";
const API_URL = "https://api.anthropic.com/v1/messages";

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_result"; tool_use_id: string; content: string };

type AnthropicMessage = { role: "user" | "assistant"; content: string | AnthropicContentBlock[] };

function toAnthropicMessages(turns: NluTurn[]): AnthropicMessage[] {
  const messages: AnthropicMessage[] = [];
  for (const turn of turns) {
    switch (turn.role) {
      case "user":
        messages.push({ role: "user", content: turn.content });
        break;
      case "assistant":
        messages.push({ role: "assistant", content: turn.content });
        break;
      case "assistant_tool_call":
        messages.push({
          role: "assistant",
          content: [{ type: "tool_use", id: turn.id, name: turn.name, input: turn.arguments }],
        });
        break;
      case "tool_result":
        messages.push({
          role: "user",
          content: [{ type: "tool_result", tool_use_id: turn.toolCallId, content: turn.content }],
        });
        break;
    }
  }
  return messages;
}

@Injectable()
export class AnthropicNluAdapter implements NluEngine {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = DEFAULT_MODEL
  ) {}

  async chat(input: NluChatInput): Promise<NluResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        system: input.systemPrompt,
        messages: toAnthropicMessages(input.turns),
        tools: input.tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          input_schema: tool.parameters,
        })),
      }),
    });

    const data: any = await response.json();
    if (!response.ok) {
      console.error("Anthropic API error:", data);
      throw new InternalServerErrorException("El motor de lenguaje natural no está disponible.");
    }

    const toolUse = data.content?.find((block: any) => block.type === "tool_use");
    if (toolUse) {
      return { text: null, toolCall: { id: toolUse.id, name: toolUse.name, arguments: toolUse.input ?? {} } };
    }

    const textBlock = data.content?.find((block: any) => block.type === "text");
    return { text: textBlock?.text ?? null, toolCall: null };
  }
}
