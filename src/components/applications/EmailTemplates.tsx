
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface EmailTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmails: string[];
  recipientNames: string[];
}

export const EmailTemplates = ({ 
  isOpen, 
  onClose, 
  recipientEmails, 
  recipientNames 
}: EmailTemplatesProps) => {
  const [selectedTab, setSelectedTab] = useState('interview');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  
  // Get email templates
  const templates = {
    interview: {
      subject: "Interview Invitation - [Company Name]",
      body: `Dear ${recipientNames.length === 1 ? recipientNames[0] : 'Candidate'},

We're pleased to invite you for an interview for the [Job Position] role at [Company Name]. 

Interview Details:
- Date: [Date]
- Time: [Time]
- Location: [Location/Video Link]

Please confirm your availability by replying to this email.

Looking forward to speaking with you!

Best regards,
[Your Name]
[Company Name]`
    },
    rejection: {
      subject: "Application Status Update - [Company Name]",
      body: `Dear ${recipientNames.length === 1 ? recipientNames[0] : 'Candidate'},

Thank you for your interest in the [Job Position] role and for the time you've invested in applying.

After careful consideration, we have decided to move forward with other candidates whose qualifications better match our current needs.

We appreciate your interest in joining our team and wish you the best in your job search.

Best regards,
[Your Name]
[Company Name]`
    },
    assessment: {
      subject: "Skills Assessment - [Company Name]",
      body: `Dear ${recipientNames.length === 1 ? recipientNames[0] : 'Candidate'},

As part of our evaluation process for the [Job Position] role, we'd like to invite you to complete a skills assessment.

Assessment Details:
- Access Link: [Assessment URL]
- Duration: [Time] minutes
- Deadline: [Date]

This assessment will help us understand your skills better. Please complete it at your earliest convenience but before the deadline.

If you have any questions, don't hesitate to reach out.

Best regards,
[Your Name]
[Company Name]`
    },
    custom: {
      subject: "",
      body: ""
    }
  };
  
  // Set email content when tab changes
  React.useEffect(() => {
    if (selectedTab === 'custom') {
      setEmailSubject('');
      setEmailContent('');
    } else {
      const template = templates[selectedTab as keyof typeof templates];
      setEmailSubject(template.subject);
      setEmailContent(template.body);
    }
  }, [selectedTab, recipientNames]);
  
  const handleSendEmail = () => {
    // In a real app, you would send the email via your backend
    toast({
      title: "Email sent",
      description: `Email sent to ${recipientEmails.length} recipients`
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Email Templates</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-2">
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm">
              <span className="font-medium">To:</span> {recipientEmails.join(', ')}
            </p>
          </div>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="interview">Interview</TabsTrigger>
              <TabsTrigger value="rejection">Rejection</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="subject" className="text-sm font-medium mb-1 block">
                  Subject
                </label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              
              <div>
                <label htmlFor="content" className="text-sm font-medium mb-1 block">
                  Content
                </label>
                <Textarea
                  id="content"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  placeholder="Email content"
                  rows={12}
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Note: Replace placeholders like [Company Name], [Job Position], etc. with actual values before sending.</p>
              </div>
            </div>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSendEmail}>Send Email</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
