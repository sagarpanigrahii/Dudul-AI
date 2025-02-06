import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion } from "framer-motion";
import "./App.css"; // Import plain CSS file

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function App() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Typing indicator state

  const sendMessage = async () => {
    if (!input.trim() || !API_KEY) {
      console.error("API key is missing or input is empty!");
      return;
    }

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true); // Show typing indicator

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: input }] }],
      });

      if (!response || !response.response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Invalid response from AI.");
      }

      const botMessage = {
        role: "assistant",
        content: response.response.candidates[0].content.parts[0].text,
      };

      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      alert("Failed to fetch AI response. Please try again later.");
    } finally {
      setIsTyping(false); // Hide typing indicator
    }
  };

  return (
    <div className="container">
      <motion.div
        className="chatbox"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="title">🤖 Dudul AI Chatbot</h1>

        {/* Chat Messages */}
        <div className="messages">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`message ${msg.role}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.content}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              className="typing-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <span></span>
              <span></span>
              <span></span>
            </motion.div>
          )}
        </div>

        {/* Input Box */}
        <div className="input-box">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <motion.button
            onClick={sendMessage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="send-btn"
          >
            🚀
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
