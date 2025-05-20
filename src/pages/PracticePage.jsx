
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Send,
  Briefcase,
  Code,
  Users,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useInterview } from '@/contexts/InterviewContext';
import { InterviewProvider } from '@/contexts/InterviewContext';
import { useToast } from '@/components/ui/use-toast';

const PracticePage = () => {
  const { user } = useAuth();
  const { interviews, startInterview, saveAnswer, completeInterview, getInterview } = useInterview();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Setup states
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('technical');
  const [jobTitle, setJobTitle] = useState('');
  const [activeInterview, setActiveInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for URL params to continue an interview
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const params = new URLSearchParams(location.search);
    const continueId = params.get('continue');
    
    if (continueId) {
      const interview = getInterview(continueId);
      if (interview && interview.status === 'in-progress') {
        setActiveInterview(interview);
        setStep(2); // Jump to interview step
        
        // Find the first unanswered question
        const firstUnansweredIndex = interview.answers.findIndex(a => !a.trim());
        setCurrentQuestionIndex(firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0);
        setAnswer(interview.answers[firstUnansweredIndex >= 0 ? firstUnansweredIndex : 0] || '');
      } else {
        // Invalid or completed interview ID
        navigate('/practice');
      }
    }
  }, [user, location.search, navigate, getInterview]);

  // Timer for interview questions
  useEffect(() => {
    if (step === 2 && activeInterview) {
      // Set 3 minutes per question
      setTimeLeft(180);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [step, currentQuestionIndex, activeInterview]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStartInterview = () => {
    if (!jobTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Job title required",
        description: "Please enter a job title to continue.",
      });
      return;
    }
    
    const result = startInterview(category, jobTitle);
    
    if (result.success) {
      setActiveInterview(result.interview);
      setCurrentQuestionIndex(0);
      setAnswer('');
      setStep(2);
    }
  };

  const handleSaveAnswer = () => {
    if (!answer.trim()) {
      toast({
        variant: "destructive",
        title: "Answer required",
        description: "Please provide an answer before continuing.",
      });
      return;
    }
    
    saveAnswer(activeInterview.id, currentQuestionIndex, answer);
    
    // Move to next question or finish
    if (currentQuestionIndex < activeInterview.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer(activeInterview.answers[currentQuestionIndex + 1] || '');
    } else {
      setStep(3); // Move to completion step
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Save current answer first
      saveAnswer(activeInterview.id, currentQuestionIndex, answer);
      
      // Go to previous question
      setCurrentQuestionIndex(prev => prev - 1);
      setAnswer(activeInterview.answers[currentQuestionIndex - 1] || '');
    }
  };

  const handleCompleteInterview = () => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      completeInterview(activeInterview.id);
      setIsSubmitting(false);
      navigate(`/feedback/${activeInterview.id}`);
    }, 1500);
  };

  const renderSetupStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Set Up Your Practice Interview</CardTitle>
          <CardDescription>
            Choose the type of interview you want to practice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="interview-type">Interview Type</Label>
            <Tabs defaultValue={category} onValueChange={setCategory} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="technical" className="flex items-center justify-center">
                  <Code className="mr-2 h-4 w-4" />
                  Technical
                </TabsTrigger>
                <TabsTrigger value="behavioral" className="flex items-center justify-center">
                  <Users className="mr-2 h-4 w-4" />
                  Behavioral
                </TabsTrigger>
                <TabsTrigger value="system_design" className="flex items-center justify-center">
                  <Database className="mr-2 h-4 w-4" />
                  System Design
                </TabsTrigger>
              </TabsList>
              <TabsContent value="technical" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Practice technical questions related to programming, algorithms, and software development concepts.
                </p>
              </TabsContent>
              <TabsContent value="behavioral" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Practice answering questions about your past experiences, teamwork, and problem-solving approach.
                </p>
              </TabsContent>
              <TabsContent value="system_design" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Practice designing scalable systems and architectures for complex applications.
                </p>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title</Label>
            <div className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                id="job-title"
                placeholder="e.g., Software Engineer, Product Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This helps us tailor the questions to your target role.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button onClick={handleStartInterview}>
            Start Interview <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  const renderInterviewStep = () => {
    if (!activeInterview) return null;
    
    const question = activeInterview.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / activeInterview.questions.length) * 100;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">
              {activeInterview.category === 'technical' ? 'Technical Interview' :
               activeInterview.category === 'behavioral' ? 'Behavioral Interview' :
               'System Design Interview'}
            </h2>
            <h1 className="text-2xl font-bold">{activeInterview.jobTitle}</h1>
          </div>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className={`font-mono ${timeLeft < 30 ? 'text-destructive' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {currentQuestionIndex + 1} of {activeInterview.questions.length}</CardTitle>
              <div className="text-sm text-muted-foreground">
                Progress: {Math.round(progress)}%
              </div>
            </div>
            <div className="w-full bg-muted h-2 rounded-full mt-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">{question}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <textarea
                id="answer"
                className="w-full min-h-[200px] p-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleSaveAnswer}>
              {currentQuestionIndex < activeInterview.questions.length - 1 ? (
                <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
              ) : (
                <>Finish <CheckCircle className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  const renderCompletionStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Interview Complete!</CardTitle>
          <CardDescription>
            You've answered all the questions. Ready to get your feedback?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Great job!</h3>
            <p className="text-muted-foreground">
              You've completed your {activeInterview?.category} interview for the {activeInterview?.jobTitle} position.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">What happens next?</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                <span>Our AI will analyze your responses</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                <span>You'll receive detailed feedback on your answers</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                <span>We'll highlight your strengths and areas for improvement</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                <span>You'll get a score to track your progress over time</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setStep(2)}
            disabled={isSubmitting}
          >
            Review Answers
          </Button>
          <Button 
            onClick={handleCompleteInterview}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>Get Feedback <Send className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-32">
      {step === 0 && renderSetupStep()}
      {step === 2 && renderInterviewStep()}
      {step === 3 && renderCompletionStep()}
    </div>
  );
};

const PracticePageWithProvider = () => (
  <InterviewProvider>
    <PracticePage />
  </InterviewProvider>
);

export default PracticePageWithProvider;
