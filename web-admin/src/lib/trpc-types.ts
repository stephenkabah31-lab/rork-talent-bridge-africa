// Shared API types mirroring the TalentBridge backend tRPC router

export interface User {
  id: string;
  email: string;
  name: string;
  type: "professional" | "recruiter" | "company" | "admin";
  fullName?: string;
  companyName?: string;
  phoneNumber?: string;
  country?: string;
  profilePicture?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  isPremium?: boolean;
  isAdmin?: boolean;
  connections?: string[];
}

export interface AdminUser extends User {
  isAdmin: true;
}

export interface ProfessionalApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  experience: string;
  skills: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface RecruiterApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface CompanyApplication {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  industry: string;
  website: string;
  registrationNumber: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  salary?: string;
  description: string;
  requirements: string[];
  postedBy: string;
  postedAt: string;
  applicants: number;
  status: "active" | "closed" | "flagged";
}

export interface Analytics {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalPosts: number;
  pendingApprovals: number;
  activeUsers: number;
  jobsByStatus: { active: number; closed: number; flagged: number };
  applicationsByStatus: {
    pending: number;
    reviewing: number;
    shortlisted: number;
    accepted: number;
    rejected: number;
  };
}
