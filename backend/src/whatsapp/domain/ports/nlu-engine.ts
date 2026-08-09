export const NLU_ENGINE = Symbol("NLU_ENGINE");

export interface NluToolDefinition {
  name: string;
  description: string;
  /** JSON Schema del objeto de argumentos. */
  parameters: Record<string, unknown>;
}

export type NluTurn =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string }
  | {
      role: "assistant_tool_call";
      id: string;
      name: string;
      arguments: Record<string, unknown>;
      /** Dato opaco propio del proveedor (ej. thoughtSignature de Gemini) que debe rebotarse sin interpretar. */
      providerData?: unknown;
    }
  | { role: "tool_result"; toolCallId: string; name: string; content: string };

export interface NluToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  /** Dato opaco propio del proveedor que el use case debe reenviar en el turno assistant_tool_call siguiente. */
  providerData?: unknown;
}

export interface NluResponse {
  text: string | null;
  toolCall: NluToolCall | null;
}

export interface NluChatInput {
  systemPrompt: string;
  turns: NluTurn[];
  tools: NluToolDefinition[];
}

/**
 * Port agnóstico de proveedor LLM: el motor conversacional del bot habla contra
 * esta interfaz; elegir Anthropic u OpenAI es solo cambiar el adapter por env var.
 */
export interface NluEngine {
  chat(input: NluChatInput): Promise<NluResponse>;
}
