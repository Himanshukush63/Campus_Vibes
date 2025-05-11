import React, { useState } from 'react';
import axios from 'axios';

// This component handles the chatbot logic
const Chatbot = {
  // Chatbot user profile data
  profile: {
    _id: 'chatbot-assistant',
    fullName: 'Campus Assistant',
    image: '/uploads/chatbot-avatar.png', // This path will be prefixed with API base URL when displayed
    email: 'assistant@campusvibes.com',
    type: 'system'
  },
  
  // Process a message and get a response
  async getResponse(message) {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/chatbot/message`,
        { message },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      return response.data.response;
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      return "Sorry, I'm having trouble processing your request right now.";
    }
  },
  
  // Create a chat object for the chatbot
  createChatObject() {
    return {
      _id: 'chatbot-chat',
      participants: [this.profile],
      lastMessage: {
        content: "Hi! I'm your Campus Assistant. How can I help you today?",
        createdAt: new Date().toISOString(),
        sender: this.profile._id
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBot: true
    };
  },
  
  // Create a welcome message from the chatbot
  createWelcomeMessage() {
    return {
      _id: `chatbot-msg-${Date.now()}`,
      content: "Hi! I'm your Campus Assistant. How can I help you today?",
      sender: this.profile._id,
      createdAt: new Date().toISOString(),
      chat: 'chatbot-chat'
    };
  }
};

export default Chatbot;
