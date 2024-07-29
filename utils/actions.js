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

export const getExistingTour = async ({ city, country }) => {
  return null;
};

export const generateTourResponse = async ({ city, country }) => {
  return null;
};

export const createNewTour = async (tour) => {
  return null;
};

/*
const apiRequestJson = {
messages: [{ role: "user", content: "create a one-day tour of boston in USA" }],
functions: [
    {
      name: "get_me_tours",
      description: "get me exciting places in a city of a country",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "the name of  city in a country, e.g. San Francisco, USA",
          },
          country: {
            type: "string",
            description: "name of a country",
          },
        },
      },
      required: ["city", "country"],
    },
  ],
  stream: false,
  function_call: "get_me_tours",
}*/
