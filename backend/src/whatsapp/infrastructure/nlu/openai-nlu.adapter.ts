import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { NluChatInput, NluEngine, NluResponse, NluTurn } from "../../domain/ports/nlu-engine";

const DEFAULT_MODEL = "gpt-4o-mini";
const API_URL = "https://api.openai.com/v1/chat/completions";

type OpenAiMessage =
  | { role: "user" | "assistant"; content: string }
  | { role: "assistant"; content: null; tool_calls: { id: string; type: "function"; function: { name: string; arguments: string } }[] }
  | { role: "tool"; tool_call_id: string; content: string };

function toOpenAiMessages(turns: NluTurn[]): OpenAiMessage[] {
  const messages: OpenAiMessage[] = [];
  for (const turn of turns) {
    switch (turn.role) {
      case "user": {
        messages.push({ role: "user", content: turn.content });
        break;
      }
      case "assistant": {
        messages.push({ role: "assistant", content: turn.content });
        break;
      }
      case "assistant_tool_call": {
        messages.push({
          role: "assistant",
          content: null,
          tool_calls: [
            { id: turn.id, type: "function", function: { name: turn.name, arguments: JSON.stringify(turn.arguments) } },
          ],
        });
        break;
      }
      case "tool_result": {
        messages.push({ role: "tool", tool_call_id: turn.toolCallId, content: turn.content });
        break;
      }
    }
  }
  return messages;
}

@Injectable()
export class OpenAiNluAdapter implements NluEngine {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = DEFAULT_MODEL
  ) {}

  async chat(input: NluChatInput): Promise<NluResponse> {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "system", content: input.systemPrompt }, ...toOpenAiMessages(input.turns)],
        tools: input.tools.map((tool) => ({
          type: "function",
          function: { name: tool.name, description: tool.description, parameters: tool.parameters },
        })),
      }),
    });

    const data: any = await response.json();
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      throw new InternalServerErrorException("El motor de lenguaje natural no está disponible.");
    }

    const message = data.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];
    if (toolCall) {
      let parsedArguments: Record<string, unknown> = {};
      try {
        parsedArguments = JSON.parse(toolCall.function.arguments ?? "{}");
      } catch {
        parsedArguments = {};
      }
      return { text: null, toolCall: { id: toolCall.id, name: toolCall.function.name, arguments: parsedArguments } };
    }

    return { text: message?.content ?? null, toolCall: null };
  }
}
