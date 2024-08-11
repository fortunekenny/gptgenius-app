"use server";

import LlamaAI from "llamaai";
import prisma from "@/utils/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

export const generateTourResponse = async ({ city, country }) => {
  const query = `Find a ${city} in this ${country}.
If ${city} in this ${country} exists, create a list of things families can do in ${city}, ${country}. 
Once you have a list, create a one-day tour. The response should be in the following JSON format: 
{
  "tour": {
    "city": "${city}",
    "country": "${country}",
    "title": "title of the tour",
    "description": "description of the city and tour",
    "stops": ["short paragraph on stop 1", "short paragraph on stop 2"]
  }
}
If you can't find info on the exact ${city}, or ${city} does not exist, or its population is less than 1, or it is not located in the specified ${country}, return { "tour": null } with no additional characters.`;

  //, "short paragraph on stop 3"

  const apiRequestJson = {
    model: "llama3.1-405b", // Ensure this model is available and correct
    messages: [
      { role: "system", content: "I am a tour guide." },
      { role: "user", content: query },
    ],
    temperature: 0,
    max_tokens: 300,
  };

  try {
    const response = await llamaAPI.run(apiRequestJson);
    const tourData = JSON.parse(response?.choices?.[0]?.message?.content);
    const tokens = response.usage.total_tokens;

    if (!tourData.tour) {
      throw new Error(
        "Invalid response format or no message content returned."
      );
    }

    // console.log("response", { tour: tourData.tour, tokens: tokens });
    return { tour: tourData.tour, tokens: tokens };
  } catch (error) {
    console.error(
      "Error in generateTourResponse:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getExistingTour = async ({ city, country }) => {
  city = city.charAt(0).toUpperCase() + city.slice(1);
  country = country.charAt(0).toUpperCase() + country.slice(1);
  return prisma.tour.findUnique({
    where: {
      city_country: {
        city,
        country,
      },
    },
  });
};

export const createNewTour = async (tour) => {
  return prisma.tour.create({
    data: tour,
  });
};

export const getAllTours = async (searchTerm) => {
  if (!searchTerm) {
    const tours = await prisma.tour.findMany({
      orderBy: {
        city: "asc",
      },
    });

    return tours;
  }

  const tours = await prisma.tour.findMany({
    where: {
      OR: [
        {
          city: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          country: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      city: "asc",
    },
  });
  return tours;
};

export const getSingleTour = async (id) => {
  return prisma.tour.findUnique({
    where: {
      id,
    },
  });
};

export const fetchUserTokensById = async (clerkId) => {
  const result = await prisma.token.findUnique({
    where: {
      clerkId,
    },
  });

  return result?.tokens;
};

export const generateUserTokensForId = async (clerkId) => {
  const result = await prisma.token.create({
    data: {
      clerkId,
    },
  });
  return result?.tokens;
};

export const fetchOrGenerateTokens = async (clerkId) => {
  const result = await fetchUserTokensById(clerkId);
  if (result) {
    return result.tokens;
  }
  return (await generateUserTokensForId(clerkId)).tokens;
};

export const subtractTokens = async (clerkId, tokens) => {
  const result = await prisma.token.update({
    where: {
      clerkId,
    },
    data: {
      tokens: {
        decrement: tokens,
      },
    },
  });
  revalidatePath("/profile");
  // Return the new token value
  return result.tokens;
};

export const incrementTokensTo1000IfLessThan300 = async (clerkId) => {
  // First, retrieve the current token balance for the user
  const user = await prisma.token.findUnique({
    where: {
      clerkId,
    },
    select: {
      tokens: true,
    },
  });

  // Check if the user's token balance is less than 300
  if (user.tokens < 300) {
    // Set the tokens to 1000
    const result = await prisma.token.update({
      where: {
        clerkId,
      },
      data: {
        tokens: 1000, // Directly set the token balance to 1000
      },
    });

    // Revalidate the path (optional, depending on your setup)
    revalidatePath("/profile");

    // Return the new token value (which should be 1000)
    return result.tokens;
  } else {
    // If tokens are 300 or more, return the current token value without change
    return user.tokens;
  }
};
