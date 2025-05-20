
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Clock, 
  Calendar, 
  Award, 
  ArrowUpRight, 
  ArrowRight,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { useInterview } from '@/contexts/InterviewContext';
import { InterviewProvider } from '@/contexts/InterviewContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const { interviews, loading, deleteInterview } = useInterview();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    recentActivity: [],
    categoryBreakdown: {
      technical: 0,
      behavioral: 0,
      system_design: 0
    }
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!loading && interviews.length > 0) {
      // Calculate dashboard statistics
      const completed = interviews.filter(interview => interview.status === 'completed');
      const totalScore = completed.reduce((sum, interview) => sum + (interview.score || 0), 0);
      const avgScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
      
      // Category breakdown
      const categoryCount = {
        technical: interviews.filter(i => i.category === 'technical').length,
        behavioral: interviews.filter(i => i.category === 'behavioral').length,
        system_design: interviews.filter(i => i.category === 'system_design').length
      };
      
      // Recent activity (last 5 interviews)
      const recent = [...interviews].sort((a, b) => {
        return new Date(b.startTime) - new Date(a.startTime);
      }).slice(0, 5);
      
      setStats({
        totalInterviews: interviews.length,
        completedInterviews: completed.length,
        averageScore: avgScore,
        recentActivity: recent,
        categoryBreakdown: categoryCount
      });
    }
  }, [interviews, loading]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDeleteClick = (interview) => {
    setInterviewToDelete(interview);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (interviewToDelete) {
      deleteInterview(interviewToDelete.id);
      setDeleteDialogOpen(false);
      setInterviewToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.displayName || 'User'}
            </p>
          </div>
          <Button 
            onClick={() => navigate('/practice')}
            className="mt-4 md:mt-0"
          >
            Start New Interview <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Interviews
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedInterviews} completed
                </p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <Progress value={stats.averageScore} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Interview Types
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="font-bold">{stats.categoryBreakdown.technical}</div>
                    <div className="text-muted-foreground">Technical</div>
                  </div>
                  <div>
                    <div className="font-bold">{stats.categoryBreakdown.behavioral}</div>
                    <div className="text-muted-foreground">Behavioral</div>
                  </div>
                  <div>
                    <div className="font-bold">{stats.categoryBreakdown.system_design}</div>
                    <div className="text-muted-foreground">System Design</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Interviews</CardTitle>
                <CardDescription>
                  Your most recent interview sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentActivity.map((interview) => (
                      <div 
                        key={interview.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            interview.category === 'technical' ? 'bg-blue-100 text-blue-600' :
                            interview.category === 'behavioral' ? 'bg-green-100 text-green-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {interview.category === 'technical' ? 'T' :
                             interview.category === 'behavioral' ? 'B' : 'S'}
                          </div>
                          <div>
                            <h4 className="font-medium">{interview.jobTitle || 'Interview'}</h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              {formatDate(interview.startTime)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {interview.status === 'completed' ? (
                            <>
                              <div className="text-right mr-2">
                                <div className="font-medium">{interview.score}%</div>
                                <div className="text-xs text-muted-foreground">Score</div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/feedback/${interview.id}`)}
                              >
                                View
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/practice?continue=${interview.id}`)}
                            >
                              Continue
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(interview)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No interviews yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/practice')}
                    >
                      Start your first interview
                    </Button>
                  </div>
                )}
              </CardContent>
              {stats.totalInterviews > 5 && (
                <CardFooter>
                  <Button variant="ghost" className="w-full">
                    View all interviews
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>

          {/* Tips and Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Interview Tips</CardTitle>
                <CardDescription>
                  Improve your interview skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="technical">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                  </TabsList>
                  <TabsContent value="technical" className="space-y-4">
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">Practice algorithms</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Regular practice of common algorithms and data structures is key to success.
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">Explain your thought process</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Interviewers want to hear how you approach problems, not just the solution.
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">Review fundamentals</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ensure you have a solid understanding of language fundamentals and core concepts.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="behavioral" className="space-y-4">
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">Use the STAR method</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Structure your answers with Situation, Task, Action, and Result.
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">Prepare specific examples</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Have concrete examples ready for common behavioral questions.
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">Show growth mindset</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Demonstrate how you learn from challenges and continuously improve.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="system" className="space-y-4">
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">Clarify requirements first</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Always start by understanding the problem scope and constraints.
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">Consider scalability</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Think about how your solution will scale with increasing users or data.
                      </p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <h3 className="font-medium">Discuss trade-offs</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Explicitly mention the pros and cons of different approaches you consider.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  View all resources <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interview? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DashboardPageWithProvider = () => (
  <InterviewProvider>
    <DashboardPage />
  </InterviewProvider>
);

export default DashboardPageWithProvider;
