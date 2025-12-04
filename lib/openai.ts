import Openai from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY env variable");
}

export const openai = new Openai({
  apiKey: process.env.OPENAI_API_KEY,
});

