import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { NluChatInput, NluEngine, NluResponse, NluTurn } from "../../domain/ports/nlu-engine";

const DEFAULT_MODEL = "gemini-flash-latest";
const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, unknown> }; thoughtSignature?: string }
  | { functionResponse: { name: string; response: Record<string, unknown> } };

// Solo "user" y "model" son roles válidos: la respuesta de una función también viaja como "user".
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

function toGeminiContents(turns: NluTurn[]): GeminiContent[] {
  const contents: GeminiContent[] = [];
  for (const turn of turns) {
    switch (turn.role) {
      case "user": {
        contents.push({ role: "user", parts: [{ text: turn.content }] });
        break;
      }
      case "assistant": {
        contents.push({ role: "model", parts: [{ text: turn.content }] });
        break;
      }
      case "assistant_tool_call": {
        const part: GeminiPart = { functionCall: { name: turn.name, args: turn.arguments } };
        // Los modelos con razonamiento (gemini-3.x) exigen rebotar el thoughtSignature de la
        // llamada anterior o rechazan el request con 400 — ver providerData en NluToolCall.
        const providerData = turn.providerData as { thoughtSignature?: string } | undefined;
        if (providerData?.thoughtSignature) {
          part.thoughtSignature = providerData.thoughtSignature;
        }
        contents.push({ role: "model", parts: [part] });
        break;
      }
      case "tool_result": {
        // Gemini no tiene tool_call_id: correlaciona la respuesta por nombre de función,
        // y el turno va con role "user" (role "function" no existe en esta API).
        contents.push({
          role: "user",
          parts: [{ functionResponse: { name: turn.name, response: { content: turn.content } } }],
        });
        break;
      }
    }
  }
  return contents;
}

@Injectable()
export class GeminiNluAdapter implements NluEngine {
  constructor(
    private readonly apiKey: string,
    private readonly model: string = DEFAULT_MODEL
  ) {}

  async chat(input: NluChatInput): Promise<NluResponse> {
    const url = `${API_BASE_URL}/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: input.systemPrompt }] },
        contents: toGeminiContents(input.turns),
        tools:
          input.tools.length > 0
            ? [
                {
                  functionDeclarations: input.tools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters,
                  })),
                },
              ]
            : undefined,
      }),
    });

    const data: any = await response.json();
    if (!response.ok) {
      console.error("Gemini API error:", data);
      throw new InternalServerErrorException("El motor de lenguaje natural no está disponible.");
    }

    const parts: any[] = data.candidates?.[0]?.content?.parts ?? [];
    const functionCallPart = parts.find((part) => part.functionCall);
    if (functionCallPart) {
      const { name, args, id } = functionCallPart.functionCall;
      const thoughtSignature = functionCallPart.thoughtSignature as string | undefined;
      return {
        text: null,
        toolCall: {
          id: id ?? `gemini_${name}_${Date.now()}`,
          name,
          arguments: args ?? {},
          providerData: thoughtSignature ? { thoughtSignature } : undefined,
        },
      };
    }

    const textPart = parts.find((part) => typeof part.text === "string");
    return { text: textPart?.text ?? null, toolCall: null };
  }
}
