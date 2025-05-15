
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EmailTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmails: string[];
  recipientNames: string[];
}

const EMAIL_TEMPLATES = [
  {
    id: "interview-invite",
    name: "Interview Invitation",
    subject: "Interview Invitation from ABC Company",
    body: `Dear {{candidateName}},

We are pleased to inform you that your application has progressed to the next stage of our hiring process. We would like to invite you for an interview.

Please let us know your availability for the coming week, and we will schedule a time that works for both parties.

Best regards,
HR Team
ABC Company`
  },
  {
    id: "application-received",
    name: "Application Received",
    subject: "We've received your application",
    body: `Dear {{candidateName}},

Thank you for submitting your application to ABC Company. We have received your application and are currently reviewing it.

We will contact you if your qualifications match our requirements.

Best regards,
HR Team
ABC Company`
  },
  {
    id: "assessment-invitation",
    name: "Assessment Invitation",
    subject: "Complete your skills assessment",
    body: `Dear {{candidateName}},

As part of our selection process, we'd like to invite you to complete a skills assessment. This will help us better understand your abilities and how they align with the position.

Please click the link below to start your assessment:
[Assessment Link]

Best regards,
HR Team
ABC Company`
  }
];

export const EmailTemplates: React.FC<EmailTemplatesProps> = ({
  isOpen,
  onClose,
  recipientEmails,
  recipientNames,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("interview-invite");
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [emailBody, setEmailBody] = useState<string>("");
  const [isSending, setIsSending] = useState(false);

  // Load template when template id changes
  React.useEffect(() => {
    const template = EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (template) {
      setEmailSubject(template.subject);
      
      // Replace placeholders with actual data for the first recipient
      let processedBody = template.body;
      if (recipientNames && recipientNames.length > 0) {
        processedBody = processedBody.replace(/{{candidateName}}/g, recipientNames[0]);
        
        // Add note about multiple recipients
        if (recipientEmails.length > 1) {
          processedBody += "\n\nNote: This email will be sent to multiple recipients.";
        }
      }
      
      setEmailBody(processedBody);
    }
  }, [selectedTemplateId, recipientEmails, recipientNames]);

  const handleSendEmail = async () => {
    setIsSending(true);
    
    try {
      // This would connect to a backend service to send the emails
      // Since this is just a UI mockup, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Email${recipientEmails.length > 1 ? 's' : ''} sent successfully!`);
      onClose();
    } catch (error) {
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Email to Candidates</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">To:</label>
            <div className="bg-muted/50 p-2 rounded-md text-sm">
              {recipientEmails.join(", ")}
              <div className="text-xs text-muted-foreground mt-1">
                {recipientEmails.length} recipient{recipientEmails.length !== 1 && "s"}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Template:</label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {EMAIL_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject:</label>
            <Input 
              value={emailSubject} 
              onChange={e => setEmailSubject(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Message:</label>
            <Textarea 
              value={emailBody} 
              onChange={e => setEmailBody(e.target.value)}
              rows={10} 
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} disabled={isSending}>
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
