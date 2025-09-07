// pages/api/chatbot.ts
import { readFileSync } from "fs";
import path from "path";

export async function POST(req: Request) {
  const { message } = await req.json();
  const filePath = path.join(process.cwd(), "data", "well_data.json");
  const data = JSON.parse(readFileSync(filePath, "utf-8"));

  const prompt = `Here is well data: ${JSON.stringify(data)}. Answer user question: ${message}`;

  // call OpenAI API with prompt
}
