// controllers/chatbotController.js
const User = require("../models/User");

// Process chatbot messages
const processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    // Get user information for personalized responses
    const user = await User.findById(userId).select("fullName type");
    
    // Simple rule-based chatbot responses
    let response = getBotResponse(message, user);
    
    res.status(200).json({ response });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Rule-based response generator
const getBotResponse = (message, user) => {
  const lowerMessage = message.toLowerCase();
  
  // Greeting patterns
  if (containsAny(lowerMessage, ['hi', 'hello', 'hey', 'greetings'])) {
    return `Hello ${user.fullName}! How can I help you today?`;
  }
  
  // Campus information
  if (containsAny(lowerMessage, ['campus', 'college', 'university', 'school'])) {
    if (containsAny(lowerMessage, ['map', 'location', 'where', 'find'])) {
      return "You can find the campus map in the Resources section. Is there a specific building you're looking for?";
    }
    if (containsAny(lowerMessage, ['hours', 'open', 'close', 'timing'])) {
      return "The main campus is open from 7:00 AM to 10:00 PM on weekdays, and 8:00 AM to 6:00 PM on weekends.";
    }
    return "Our campus offers state-of-the-art facilities including libraries, labs, sports complexes, and dining options. What would you like to know about?";
  }
  
  // Courses and academics
  if (containsAny(lowerMessage, ['course', 'class', 'subject', 'lecture', 'academic'])) {
    if (containsAny(lowerMessage, ['register', 'sign up', 'enroll', 'join'])) {
      return "Course registration is available through the Student Portal. The registration period for the next semester begins on August 15th.";
    }
    if (containsAny(lowerMessage, ['schedule', 'timetable', 'timing'])) {
      return "Your course schedule can be viewed in the Academics section of your student portal.";
    }
    return "We offer a wide range of courses across various disciplines. You can browse the course catalog in the Academics section.";
  }
  
  // Events
  if (containsAny(lowerMessage, ['event', 'workshop', 'seminar', 'conference', 'fest'])) {
    return "You can find upcoming events on the Events page. There are several workshops and seminars scheduled for this month.";
  }
  
  // Help with the app
  if (containsAny(lowerMessage, ['app', 'website', 'portal', 'system', 'platform', 'how to'])) {
    if (containsAny(lowerMessage, ['use', 'navigate', 'find'])) {
      return "Our platform has several features including messaging, posts, announcements, and groups. Is there a specific feature you need help with?";
    }
    if (containsAny(lowerMessage, ['problem', 'issue', 'error', 'bug', 'not working'])) {
      return "I'm sorry you're experiencing issues. Please try refreshing the page or clearing your cache. If the problem persists, contact our IT support at support@campusvibes.com.";
    }
    return "CampusVibes is designed to enhance your campus experience by connecting you with peers, faculty, and resources. What would you like to know about using the platform?";
  }
  
  // Faculty specific (if user is faculty)
  if (user.type === 'faculty') {
    if (containsAny(lowerMessage, ['grade', 'assessment', 'evaluation', 'mark'])) {
      return "You can enter and manage student grades through the Faculty Portal under the Assessments section.";
    }
  }
  
  // Student specific (if user is student)
  if (user.type === 'student') {
    if (containsAny(lowerMessage, ['assignment', 'homework', 'project', 'submission'])) {
      return "You can view and submit assignments through the Assignments section in your student portal.";
    }
    if (containsAny(lowerMessage, ['grade', 'result', 'score', 'mark'])) {
      return "Your grades and academic progress can be viewed in the Academics section of your student portal.";
    }
  }
  
  // Default responses for unknown queries
  const defaultResponses = [
    "I'm not sure I understand. Could you please rephrase your question?",
    "I don't have information on that topic yet. Is there something else I can help you with?",
    "That's an interesting question. Let me suggest you check with the relevant department for more accurate information.",
    "I'm still learning! Could you ask something about campus facilities, courses, or events?",
    "I'm not programmed to answer that specific question. Can I help you with something else?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Helper function to check if message contains any of the keywords
const containsAny = (text, keywords) => {
  return keywords.some(keyword => text.includes(keyword));
};

module.exports = {
  processMessage
};
