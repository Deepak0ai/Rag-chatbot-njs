export type Role = "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
}

export interface KnowledgeEntry {
  title: string;
  content: string;
}

export interface ChatRequestBody {
  messages: Message[];
}

export interface ChatResponseBody {
  content: string;
}
