export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface ActivityLogEntry {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  creator: string;
  createdAt: string;
  dueDate?: string;
  
  // TOC specific fields
  fullKitStatus: {
    isComplete: boolean;
    checklist: ChecklistItem[];
  };
  durationEstimate50?: number; // в часах
  bufferConsumption: number; // 0-100%
  constraintType?: 'drum' | 'constraint' | 'none';
  constraintResource?: string;
  gatekeeper?: string;
  
  // Additional data
  attachments: FileAttachment[];
  comments: Comment[];
  activityLog: ActivityLogEntry[];
}
