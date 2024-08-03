"use server";

import LlamaAI from "llamaai";
import prisma from "@/utils/db";
import { Prisma } from "@prisma/client";

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
    "stops": ["short paragraph on stop 1", "short paragraph on stop 2", "short paragraph on stop 3"]
  }
}
If you can't find info on the exact ${city}, or ${city} does not exist, or its population is less than 1, or it is not located in the specified ${country}, return { "tour": null } with no additional characters.`;

  const apiRequestJson = {
    model: "llama3.1-405b", // Ensure this model is available and correct
    messages: [
      { role: "system", content: "I am a tour guide." },
      { role: "user", content: query },
    ],
    temperature: 0,
    max_tokens: 1000,
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

    console.log("total_tokens", tokens);
    return tourData.tour;
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

/*export const createNewTour = async (tour) => {
  return prisma.tour.create({
    data: tour,
  });
};*/

export const createNewTour = async (tour) => {
  // Validate the input data against the schema
  if (
    !tour.city ||
    !tour.country ||
    !tour.title ||
    !tour.description ||
    !tour.stops
  ) {
    throw new Error("Invalid tour data. Missing required fields.");
  }

  // console.log("Creating new tour with data:", tour);
  try {
    return await prisma.tour.create({
      data: tour,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      console.error("Unique constraint failed on the fields: (city, country)");
      throw new Error(
        "Tour for the specified city and country already exists."
      );
    } else {
      console.error("Error creating new tour:", error);
      throw error;
    }
  }
};
