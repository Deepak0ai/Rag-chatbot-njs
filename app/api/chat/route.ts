import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { retrieveContext } from "../../../lib/knowledgeBase";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY!
);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ reply: "Please ask something." });
    }

    const context = retrieveContext(message);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are a helpful assistant.

Use only the context below to answer.
If the answer is not in the context, say you don't know.

Context:
${context}

User question:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return NextResponse.json({
      reply: response.text(),
    });
  } catch (error) {
    console.error("CHAT API ERROR:", error);
    return NextResponse.json(
      { reply: "Error getting response." },
      { status: 500 }
    );
  }
}
