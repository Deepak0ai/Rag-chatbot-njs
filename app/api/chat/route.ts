import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import type { ChatRequestBody, ChatResponseBody, Message } from "@/types";
import { retrieveContext } from "../../../lib/knowledgeBase";
function buildPrompt(context: string, userMessage: string): string {
  return `You are a helpful and friendly AI assistant.

Use ONLY the context below to answer the user's question.
If the answer is not found in the context, say: "I don't have information on that. Please contact us directly for more details."
Be concise, clear, and helpful.

Context:
${context}

User question: ${userMessage}

Answer:`;
}

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponseBody>> {
  try {
    const apiKey: string | undefined = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          content:
            "⚠️ API key not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY in Vercel environment variables.",
        },
        { status: 500 }
      );
    }

    const body: ChatRequestBody = await req.json();
    const messages: Message[] = body.messages ?? [];

    const lastMessage: Message | undefined = messages[messages.length - 1];
    const userMessage: string = lastMessage?.content?.trim() ?? "";

    if (!userMessage) {
      return NextResponse.json({ content: "Please ask a question." });
    }

    const context: string = retrieveContext(userMessage);
    const prompt: string = buildPrompt(context, userMessage);

    const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(apiKey);
    const model: GenerativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);
    const responseText: string = result.response.text().trim();

    return NextResponse.json({
      content: responseText || "No response generated.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("CHAT API ERROR:", message);

    return NextResponse.json(
      { content: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
