import { ChatSession } from "../entities/chat-session.entity";

export const CONVERSATION_STATE_REPOSITORY = Symbol("CONVERSATION_STATE_REPOSITORY");

export interface ConversationStateRepository {
  find(phone: string, businessId: number): Promise<ChatSession | null>;
  save(phone: string, businessId: number, session: ChatSession): Promise<void>;
}
