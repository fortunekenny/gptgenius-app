"use server";

import LlamaAI from "llamaai";

const llamaAPI = new LlamaAI(process.env.LLAMA_API_KEY);

export async function getLlamaResponse(chatMessages) {
  const apiRequestJson = {
    model: "llama3.1-405b", // Ensure this model is available and correct
    //model: "llama3.1-70b", // Ensure this model is available and correct
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      ...chatMessages,
    ],
    temperature: 0.1,
    max_tokens: 50,
  };

  try {
    const response = await llamaAPI.run(apiRequestJson);
    const messageContent = response?.choices?.[0]?.message?.content;

    if (!messageContent) {
      throw new Error(
        "Invalid response format or no message content returned."
      );
    }

    return {
      message: {
        role: "assistant",
        content: messageContent,
      },
      tokens: response.usage.total_tokens,
    };
  } catch (error) {
    console.error(
      "Error in getLlamaResponse:",
      error.response?.data || error.message
    );
    throw error;
  }
}
