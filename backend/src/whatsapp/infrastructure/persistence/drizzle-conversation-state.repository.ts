import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import { DRIZZLE, DrizzleDB, schema } from "../../../database/database.module";
import { ChatSession, ChatState, SessionMetadata } from "../../domain/entities/chat-session.entity";
import { ConversationStateRepository } from "../../domain/ports/conversation-state.repository";

@Injectable()
export class DrizzleConversationStateRepository implements ConversationStateRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async find(phone: string, businessId: number): Promise<ChatSession | null> {
    const results = await this.db
      .select()
      .from(schema.conversationStates)
      .where(and(eq(schema.conversationStates.phone, phone), eq(schema.conversationStates.businessId, businessId)))
      .limit(1);

    const row = results[0];
    if (!row) {
      return null;
    }

    return {
      state: row.state as ChatState,
      metadata: row.metadata as SessionMetadata,
    };
  }

  async save(phone: string, businessId: number, session: ChatSession): Promise<void> {
    await this.db
      .insert(schema.conversationStates)
      .values({
        phone,
        businessId,
        state: session.state,
        metadata: session.metadata,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [schema.conversationStates.phone, schema.conversationStates.businessId],
        set: {
          state: session.state,
          metadata: session.metadata,
          updatedAt: new Date(),
        },
      });
  }
}
