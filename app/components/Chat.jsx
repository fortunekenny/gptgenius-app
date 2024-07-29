"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { getLlamaResponse } from "@/utils/actions"; // Adjust the import path as needed

const LlamaApiForm = () => {
  /*const [messages, setMessages] = useState([
    { role: "system", content: "How may i help you ?" },
  ]);
  const [prompt, setPrompt] = useState("");

  const { mutate, isLoading, isPending } = useMutation({
    mutationFn: async (newMessage) => {
      try {
        const response = await getLlamaResponse([...messages, newMessage]);
        return response;
      } catch (error) {
        throw new Error(error.message || "Unknown error");
      }
    },
    onSuccess: (response) => {
      if (response && response.message) {
        setMessages((prev) => [...prev, response.message]);
      } else {
        toast.error("Received unexpected response format.");
      }
    },
    onError: (error) => {
      console.error("Error in useMutation:", error);
      toast.error("Something went wrong: " + error.message);
    },
  });*/

  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      // Load messages from localStorage if available and in browser environment
      const savedMessages = localStorage.getItem("chatMessages");
      return savedMessages
        ? JSON.parse(savedMessages)
        : [{ role: "system", content: "You are a helpful assistant." }];
    } else {
      // Fallback for SSR, initial state without localStorage
      return [{ role: "system", content: "You are a helpful assistant." }];
    }
  });

  const [prompt, setPrompt] = useState("");

  const { mutate, isLoading, isPending } = useMutation({
    mutationFn: async (newMessage) => {
      try {
        const response = await getLlamaResponse([...messages, newMessage]);
        return response;
      } catch (error) {
        throw new Error(error.message || "Unknown error");
      }
    },
    onSuccess: (response) => {
      if (response && response.message) {
        const updatedMessages = [...messages, response.message];
        setMessages(updatedMessages);
        if (typeof window !== "undefined") {
          localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
        }
      } else {
        toast.error("Received unexpected response format.");
      }
    },
    onError: (error) => {
      console.error("Error in useMutation:", error);
      toast.error("Something went wrong: " + error.message);
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Save messages to localStorage whenever messages state changes
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Prompt cannot be empty");
      return;
    }

    const userMessage = { role: "user", content: prompt.trim() };
    setMessages((prev) => [...prev, userMessage]);
    mutate(userMessage);
    setPrompt("");
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] grid grid-rows-[1fr,auto]">
      <div>
        {messages.map(({ role, content }, index) => {
          const avatar = role == "user" ? "👤" : "🤖";
          const bcg = role === "user" ? "bg-base-200" : "bg-base-100";
          return (
            <div
              key={index}
              className={`${bcg} flex py-6 -mx-8 px-8 text-xl leading-loose border-b border-base-300`}
            >
              <span className="mr-4">{avatar}</span>
              <p className="max-w-3xl">{content}</p>
            </div>
          );
        })}
        {isPending ? <span className="loading"></span> : null}
      </div>
      {/*<div>
        {messages.map(({ role, content }, index) => (
          <div
            key={index}
            className={`${
              role === "user" ? "bg-base-200" : "bg-base-100"
            } flex py-6 px-8 text-xl leading-loose border-b border-base-300`}
          >
            <span className="mr-4">{role === "user" ? "👤" : "🤖"}</span>
            <p className="max-w-3xl">{content}</p>
          </div>
        ))}
        {isPending && <span className="loading"></span>}
        //{isLoading && <span className="loading"></span>} 
      </div>*/}
      <form onSubmit={handleSubmit} className="max-w-4xl pt-12">
        <div className="join w-full">
          <input
            type="text"
            placeholder="Ask GeniusGPT"
            className="input input-bordered join-item w-full"
            value={prompt}
            // required
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
          />
          <button
            className="btn btn-primary join-item"
            type="submit"
            disabled={isPending}
            // disabled={isLoading}
          >
            {isPending ? "Please wait..." : "Ask question"}
            {/* {isLoading ? "Please wait..." : "Ask question"} */}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LlamaApiForm;
