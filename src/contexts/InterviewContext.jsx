
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const InterviewContext = createContext();

export const useInterview = () => {
  return useContext(InterviewContext);
};

export const InterviewProvider = ({ children }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Sample interview questions by category
  const questionsByCategory = {
    technical: [
      "Explain the difference between var, let, and const in JavaScript.",
      "What is the virtual DOM in React and how does it work?",
      "Describe the concept of closures in JavaScript.",
      "What are React hooks and how do they improve component development?",
      "Explain the concept of promises in JavaScript and how they differ from callbacks.",
      "What is the difference between == and === in JavaScript?",
      "Describe the box model in CSS.",
      "What is event delegation in JavaScript?",
      "Explain how prototypal inheritance works in JavaScript.",
      "What is the purpose of the useEffect hook in React?",
    ],
    behavioral: [
      "Tell me about a time when you had to work under pressure to meet a deadline.",
      "Describe a situation where you had to resolve a conflict within your team.",
      "How do you handle criticism of your work?",
      "Tell me about a time when you had to learn a new skill quickly.",
      "Describe a project where you demonstrated leadership skills.",
      "How do you prioritize tasks when you have multiple deadlines?",
      "Tell me about a time when you failed at something and what you learned from it.",
      "How do you stay motivated when working on challenging projects?",
      "Describe a situation where you had to adapt to a significant change at work.",
      "Tell me about a time when you went above and beyond what was required.",
    ],
    system_design: [
      "How would you design a URL shortening service like bit.ly?",
      "Design a social media feed system that can handle millions of users.",
      "How would you design a distributed file storage system?",
      "Design a notification system for a mobile application.",
      "How would you design a real-time chat application?",
      "Design a recommendation system for an e-commerce website.",
      "How would you design a scalable API rate limiter?",
      "Design a system for a ride-sharing application like Uber.",
      "How would you design a distributed cache system?",
      "Design a system for processing and analyzing large amounts of data.",
    ],
  };

  useEffect(() => {
    // Load interviews from localStorage
    const storedInterviews = localStorage.getItem('interviews');
    if (storedInterviews) {
      try {
        setInterviews(JSON.parse(storedInterviews));
      } catch (error) {
        console.error('Error parsing stored interviews:', error);
        localStorage.removeItem('interviews');
      }
    }
    setLoading(false);
  }, []);

  // Save interviews to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('interviews', JSON.stringify(interviews));
    }
  }, [interviews, loading]);

  // Get random questions for an interview
  const getRandomQuestions = (category, count = 5) => {
    const questions = questionsByCategory[category] || [];
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Start a new interview
  const startInterview = (category, jobTitle) => {
    try {
      const questions = getRandomQuestions(category);
      const newInterview = {
        id: `interview_${Date.now()}`,
        category,
        jobTitle,
        questions,
        answers: Array(questions.length).fill(''),
        feedback: null,
        score: null,
        startTime: new Date().toISOString(),
        endTime: null,
        status: 'in-progress',
      };
      
      setInterviews(prev => [newInterview, ...prev]);
      
      return { success: true, interview: newInterview };
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        variant: "destructive",
        title: "Failed to start interview",
        description: "There was an error starting your interview. Please try again.",
      });
      return { success: false, error };
    }
  };

  // Save an answer during an interview
  const saveAnswer = (interviewId, questionIndex, answer) => {
    try {
      setInterviews(prev => {
        return prev.map(interview => {
          if (interview.id === interviewId) {
            const updatedAnswers = [...interview.answers];
            updatedAnswers[questionIndex] = answer;
            return { ...interview, answers: updatedAnswers };
          }
          return interview;
        });
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error saving answer:', error);
      toast({
        variant: "destructive",
        title: "Failed to save answer",
        description: "There was an error saving your answer. Please try again.",
      });
      return { success: false, error };
    }
  };

  // Complete an interview and generate feedback
  const completeInterview = (interviewId) => {
    try {
      setInterviews(prev => {
        return prev.map(interview => {
          if (interview.id === interviewId) {
            // Generate mock feedback and score
            const feedback = generateMockFeedback(interview);
            const score = Math.floor(Math.random() * 41) + 60; // Random score between 60-100
            
            return {
              ...interview,
              feedback,
              score,
              endTime: new Date().toISOString(),
              status: 'completed',
            };
          }
          return interview;
        });
      });
      
      toast({
        title: "Interview completed",
        description: "Your interview has been completed and feedback is ready.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error completing interview:', error);
      toast({
        variant: "destructive",
        title: "Failed to complete interview",
        description: "There was an error completing your interview. Please try again.",
      });
      return { success: false, error };
    }
  };

  // Generate mock feedback for an interview
  const generateMockFeedback = (interview) => {
    const { category, answers } = interview;
    
    // Check if any answers are empty
    const hasEmptyAnswers = answers.some(answer => !answer.trim());
    
    // Generate feedback based on category
    let generalFeedback = '';
    let strengths = [];
    let improvements = [];
    
    if (category === 'technical') {
      generalFeedback = "You demonstrated good technical knowledge in several areas. Your explanations were generally clear and structured.";
      strengths = [
        "Strong understanding of core concepts",
        "Good problem-solving approach",
        "Clear communication of technical ideas"
      ];
      improvements = [
        "Consider providing more real-world examples",
        "Deepen knowledge in advanced topics",
        "Practice explaining complex concepts more concisely"
      ];
    } else if (category === 'behavioral') {
      generalFeedback = "Your responses showed good self-awareness and ability to reflect on past experiences. You provided structured answers using the STAR method.";
      strengths = [
        "Good storytelling and situation framing",
        "Clear explanation of your specific actions",
        "Effective communication of outcomes"
      ];
      improvements = [
        "Quantify your achievements more specifically",
        "Include more reflection on what you learned",
        "Prepare more diverse examples for common questions"
      ];
    } else if (category === 'system_design') {
      generalFeedback = "You demonstrated a solid approach to system design problems. Your solutions considered scalability and reliability aspects.";
      strengths = [
        "Good understanding of system architecture principles",
        "Methodical approach to breaking down problems",
        "Consideration of performance constraints"
      ];
      improvements = [
        "Deepen knowledge of distributed systems concepts",
        "Consider trade-offs more explicitly",
        "Practice drawing system diagrams more clearly"
      ];
    }
    
    // Adjust feedback if there are empty answers
    if (hasEmptyAnswers) {
      generalFeedback += " However, some questions were not fully addressed, which affected the overall assessment.";
      improvements.unshift("Ensure all questions are answered completely");
    }
    
    return {
      generalFeedback,
      strengths,
      improvements,
      detailedFeedback: answers.map((answer, index) => {
        if (!answer.trim()) {
          return "This question was not answered. Make sure to address all questions in an interview.";
        }
        
        // Generate random detailed feedback
        const feedbackOptions = [
          "Good answer that covers the main points. Consider adding more specific examples.",
          "Well-structured response. You could elaborate more on the technical details.",
          "Clear explanation. Try to be more concise while maintaining clarity.",
          "Solid answer. Consider the interviewer's perspective and what they're looking to assess.",
          "Good start, but the answer could be more comprehensive. Think about edge cases."
        ];
        
        return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
      })
    };
  };

  // Get an interview by ID
  const getInterview = (interviewId) => {
    return interviews.find(interview => interview.id === interviewId) || null;
  };

  // Delete an interview
  const deleteInterview = (interviewId) => {
    try {
      setInterviews(prev => prev.filter(interview => interview.id !== interviewId));
      
      toast({
        title: "Interview deleted",
        description: "The interview has been deleted successfully.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting interview:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete interview",
        description: "There was an error deleting the interview. Please try again.",
      });
      return { success: false, error };
    }
  };

  const value = {
    interviews,
    loading,
    startInterview,
    saveAnswer,
    completeInterview,
    getInterview,
    deleteInterview,
    questionsByCategory,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
