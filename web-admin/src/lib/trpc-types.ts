// ── Shared API types mirroring the TalentBridge backend tRPC router ──────────

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
  isPremium: boolean;
  isAdmin: boolean;
  connections?: string[];
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
  postedAt: Date | string;
  applicants: number;
  status: "active" | "closed" | "flagged";
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  coverLetter: string;
  resume?: string;
  appliedAt: Date | string;
  status: "pending" | "reviewing" | "shortlisted" | "accepted" | "rejected";
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    title: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  createdAt: Date | string;
  likes: number;
  comments: number;
  shares: number;
  likedBy: string[];
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date | string;
}

// ── tRPC Router type ──────────────────────────────────────────────────────────

interface LoginResult {
  success: boolean;
  user: Record<string, unknown>;
  token: string;
}

interface AdminLoginResult {
  success: boolean;
  user: { id: string; email: string; name: string; type: string; isAdmin: boolean };
  token: string;
}

interface MutationResult {
  success: boolean;
  [key: string]: unknown;
}

export interface AppRouter {
  auth: {
    login: {
      mutate(input: { email: string; password: string; userType: "professional" | "recruiter" | "company" }): Promise<LoginResult>;
    };
    adminLogin: {
      mutate(input: { username: string; password: string }): Promise<AdminLoginResult>;
    };
    signup: {
      mutate(input: {
        email: string;
        password: string;
        userType: "professional" | "recruiter" | "company";
        fullName?: string;
        companyName?: string;
        phoneNumber?: string;
        country?: string;
      }): Promise<LoginResult>;
    };
    getCurrentUser: {
      query(input: { userId: string }): Promise<User | null>;
    };
  };
  admin: {
    getProfessionals: { query(): Promise<ProfessionalApplication[]> };
    getRecruiters: { query(): Promise<RecruiterApplication[]> };
    getCompanies: { query(): Promise<CompanyApplication[]> };
    getJobs: { query(): Promise<Job[]> };
    updateStatus: {
      mutate(input: { type: "professional" | "recruiter" | "company"; id: string; status: "approved" | "rejected" }): Promise<MutationResult>;
    };
    updateJobStatus: {
      mutate(input: { id: string; status: "active" | "closed" | "flagged" }): Promise<MutationResult>;
    };
    getJobApplicants: {
      query(input: { jobId: string }): Promise<unknown[]>;
    };
  };
  jobs: {
    getAll: {
      query(input?: { filter?: string; search?: string }): Promise<Job[]>;
    };
    getById: {
      query(input: { jobId: string }): Promise<Job | null>;
    };
    create: {
      mutate(input: {
        title: string;
        company: string;
        location: string;
        type: string;
        salary?: string;
        description: string;
        requirements: string[];
        postedBy: string;
      }): Promise<MutationResult>;
    };
    apply: {
      mutate(input: {
        jobId: string;
        userId: string;
        coverLetter: string;
        resume?: string;
      }): Promise<MutationResult>;
    };
    getApplications: {
      query(input?: { userId?: string; jobId?: string }): Promise<Application[]>;
    };
  };
  posts: {
    getFeed: {
      query(input?: { limit?: number }): Promise<{ posts: Post[]; nextCursor?: string }>;
    };
    create: {
      mutate(input: {
        content: string;
        image?: string;
        authorId: string;
        authorName: string;
        authorTitle: string;
      }): Promise<MutationResult>;
    };
    like: {
      mutate(input: { postId: string; userId: string }): Promise<MutationResult>;
    };
    delete: {
      mutate(input: { postId: string; userId: string }): Promise<MutationResult>;
    };
  };
  users: {
    getById: {
      query(input: { userId: string }): Promise<User | null>;
    };
    search: {
      query(input: { query: string; type?: string }): Promise<User[]>;
    };
    updateProfile: {
      mutate(input: Record<string, unknown>): Promise<MutationResult>;
    };
    connect: {
      mutate(input: { userId: string; targetUserId: string }): Promise<MutationResult>;
    };
    getConnections: {
      query(input: { userId: string }): Promise<User[]>;
    };
  };
}
