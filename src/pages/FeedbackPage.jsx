
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Award, 
  ThumbsUp, 
  AlertTriangle,
  Download,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useInterview } from '@/contexts/InterviewContext';
import { InterviewProvider } from '@/contexts/InterviewContext';
import { useToast } from '@/components/ui/use-toast';

const FeedbackPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { getInterview } = useInterview();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const interviewData = getInterview(id);
    
    if (interviewData && interviewData.status === 'completed') {
      setInterview(interviewData);
      
      // Initialize expanded state for all questions
      const expanded = {};
      interviewData.questions.forEach((_, index) => {
        expanded[index] = false;
      });
      setExpandedQuestions(expanded);
    } else {
      toast({
        variant: "destructive",
        title: "Interview not found",
        description: "The interview you're looking for doesn't exist or hasn't been completed.",
      });
      navigate('/dashboard');
    }
    
    setLoading(false);
  }, [id, user, navigate, getInterview, toast]);

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleShare = () => {
    toast({
      title: "Share feature coming soon",
      description: "You'll soon be able to share your interview results with others.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download feature coming soon",
      description: "You'll soon be able to download your interview feedback as a PDF.",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-muted-foreground">Loading your feedback...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="container mx-auto px-4 py-32 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Interview Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The interview you're looking for doesn't exist or hasn't been completed.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <Button 
              variant="ghost" 
              className="mb-2 -ml-4 text-muted-foreground"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Interview Feedback</h1>
            <p className="text-muted-foreground">
              {interview.category === 'technical' ? 'Technical Interview' :
               interview.category === 'behavioral' ? 'Behavioral Interview' :
               'System Design Interview'} for {interview.jobTitle} • {formatDate(interview.endTime)}
            </p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>
                  Your interview score and general feedback
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
                  <div className="relative w-32 h-32 mx-auto md:mx-0 mb-4 md:mb-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold">{interview.score}%</span>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="10"
                        strokeDasharray={`${interview.score * 2.83} 283`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      {interview.score >= 90 ? 'Excellent!' :
                       interview.score >= 80 ? 'Great job!' :
                       interview.score >= 70 ? 'Good work!' :
                       'Needs improvement'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {interview.feedback?.generalFeedback}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium flex items-center mb-2">
                          <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                          Strengths
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {interview.feedback?.strengths.map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium flex items-center mb-2">
                          <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {interview.feedback?.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Interview Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Interview Type</p>
                  <p className="font-medium">
                    {interview.category === 'technical' ? 'Technical Interview' :
                     interview.category === 'behavioral' ? 'Behavioral Interview' :
                     'System Design Interview'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p className="font-medium">{interview.jobTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(interview.endTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-medium">{interview.questions.length} questions</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {Math.round((new Date(interview.endTime) - new Date(interview.startTime)) / 60000)} minutes
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Detailed Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Detailed Question Analysis</CardTitle>
              <CardDescription>
                Review your answers and get specific feedback for each question
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {interview.questions.map((question, index) => (
                  <div 
                    key={index}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div 
                      className="p-4 bg-muted/50 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleQuestion(index)}
                    >
                      <div>
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <p className="text-sm text-muted-foreground">{question}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedQuestions[index] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {expandedQuestions[index] && (
                      <div className="p-4 border-t">
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2">Your Answer:</h4>
                          <div className="bg-muted/30 p-3 rounded-md">
                            {interview.answers[index] ? (
                              <p className="whitespace-pre-wrap">{interview.answers[index]}</p>
                            ) : (
                              <p className="text-muted-foreground italic">No answer provided</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Feedback:</h4>
                          <div className="bg-muted/30 p-3 rounded-md">
                            <p>{interview.feedback?.detailedFeedback[index]}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/practice')}
              >
                Practice Again
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

const FeedbackPageWithProvider = () => (
  <InterviewProvider>
    <FeedbackPage />
  </InterviewProvider>
);

export default FeedbackPageWithProvider;
