// Shared data store — single source of truth for all tRPC routes.
// In-memory for now; swap to a real DB (Supabase, etc.) by replacing the
// getters/mutators while keeping the same interface.

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

export interface AuthUser extends User {
  password: string;
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
  postedAt: Date;
  applicants: number;
  status: "active" | "closed" | "flagged";
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  coverLetter: string;
  resume?: string;
  appliedAt: Date;
  status: "pending" | "reviewing" | "shortlisted" | "accepted" | "rejected";
}

export interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
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
  createdAt: Date;
  likes: number;
  comments: number;
  shares: number;
  likedBy: string[];
}

export interface JobApplicant {
  id: string;
  name: string;
  email: string;
  title: string;
  appliedAt: string;
  status: "pending" | "shortlisted" | "rejected";
}

// ── In-memory stores ────────────────────────────────────────────

const authUsers: Record<string, AuthUser> = {};

const professionalApplications: ProfessionalApplication[] = [
  {
    id: "1",
    name: "Amara Okonkwo",
    email: "amara.okonkwo@email.com",
    phone: "+234 80 123 4567",
    location: "Lagos, Nigeria",
    title: "Senior Software Engineer",
    experience: "8 years",
    skills: ["React Native", "TypeScript", "Node.js", "AWS"],
    status: "pending",
    createdAt: "2025-01-12T10:30:00Z",
  },
  {
    id: "2",
    name: "Kwame Mensah",
    email: "kwame.mensah@email.com",
    phone: "+233 24 555 1234",
    location: "Accra, Ghana",
    title: "Product Designer",
    experience: "5 years",
    skills: ["UI/UX", "Figma", "Prototyping", "Design Systems"],
    status: "pending",
    createdAt: "2025-01-11T14:20:00Z",
  },
  {
    id: "3",
    name: "Sarah Kimani",
    email: "sarah.kimani@email.com",
    phone: "+254 70 555 9012",
    location: "Nairobi, Kenya",
    title: "Data Scientist",
    experience: "6 years",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
    status: "approved",
    createdAt: "2025-01-10T09:15:00Z",
  },
];

const recruiterApplications: RecruiterApplication[] = [
  {
    id: "1",
    name: "John Osei",
    email: "john.osei@techcorp.com",
    phone: "+233 24 777 8888",
    company: "TechCorp Africa",
    location: "Accra, Ghana",
    status: "pending",
    createdAt: "2025-01-11T11:30:00Z",
  },
  {
    id: "2",
    name: "Grace Mwangi",
    email: "grace.m@innovate.co.ke",
    phone: "+254 70 888 9999",
    company: "Innovate Kenya",
    location: "Nairobi, Kenya",
    status: "pending",
    createdAt: "2025-01-10T15:45:00Z",
  },
];

const companyApplications: CompanyApplication[] = [
  {
    id: "1",
    companyName: "Tech Africa Solutions",
    contactPerson: "Kwame Mensah",
    email: "hr@techafricasolutions.com",
    phone: "+233 24 555 1234",
    location: "Accra, Ghana",
    industry: "Technology",
    website: "www.techafricasolutions.com",
    registrationNumber: "BN20231234",
    status: "pending",
    createdAt: "2025-01-10T10:30:00Z",
  },
  {
    id: "2",
    companyName: "AfriBank Financial",
    contactPerson: "Amara Okafor",
    email: "recruitment@afribank.com",
    phone: "+234 80 555 5678",
    location: "Lagos, Nigeria",
    industry: "Finance",
    website: "www.afribank.com",
    registrationNumber: "RC45678",
    status: "pending",
    createdAt: "2025-01-11T14:20:00Z",
  },
];

const jobs: Job[] = [
  {
    id: "1",
    title: "Senior Software Engineer",
    company: "TechCorp Africa",
    location: "Lagos, Nigeria",
    type: "Full-time",
    salary: "$60,000 - $90,000",
    description: "We are seeking a talented Senior Software Engineer to join our growing team.",
    requirements: ["5+ years experience", "React Native", "Node.js"],
    postedBy: "recruiter1",
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    applicants: 45,
    status: "active",
  },
  {
    id: "2",
    title: "Product Designer",
    company: "DesignHub",
    location: "Accra, Ghana",
    type: "Remote",
    salary: "$40,000 - $60,000",
    description: "Looking for a creative Product Designer to help shape our products.",
    requirements: ["3+ years experience", "Figma", "User Research"],
    postedBy: "company1",
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    applicants: 28,
    status: "active",
  },
];

const jobApplications: Application[] = [];

const connections: Connection[] = [];

const posts: Post[] = [];

const jobApplicants: Record<string, JobApplicant[]> = {
  "1": [
    {
      id: "a1",
      name: "John Doe",
      email: "john.doe@email.com",
      title: "Senior Developer",
      appliedAt: "2025-01-10T14:30:00Z",
      status: "pending",
    },
    {
      id: "a2",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      title: "Full Stack Engineer",
      appliedAt: "2025-01-09T10:20:00Z",
      status: "shortlisted",
    },
    {
      id: "a3",
      name: "Michael Brown",
      email: "michael.b@email.com",
      title: "React Native Developer",
      appliedAt: "2025-01-08T16:45:00Z",
      status: "pending",
    },
  ],
};

// Auth helpers
export function getAuthUser(id: string): AuthUser | undefined {
  return authUsers[id];
}

export function getAuthUserByEmail(email: string): AuthUser | undefined {
  return Object.values(authUsers).find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
}

export function createAuthUser(user: AuthUser): void {
  authUsers[user.id] = user;
}

// User helpers (for users router)
export function getUsersForSearch(): User[] {
  return Object.values(authUsers).map(({ password: _, ...rest }) => rest);
}

export function getUserById(id: string): User | undefined {
  const u = authUsers[id];
  if (!u) return undefined;
  const { password: _, ...rest } = u;
  return rest;
}

// Admin helpers
export function getAllProfessionalApplications(): ProfessionalApplication[] {
  return professionalApplications;
}

export function getAllRecruiterApplications(): RecruiterApplication[] {
  return recruiterApplications;
}

export function getAllCompanyApplications(): CompanyApplication[] {
  return companyApplications;
}

export function updateProfessionalStatus(
  id: string,
  status: "approved" | "rejected",
): ProfessionalApplication | undefined {
  const app = professionalApplications.find((a) => a.id === id);
  if (app) app.status = status;
  return app;
}

export function updateRecruiterStatus(
  id: string,
  status: "approved" | "rejected",
): RecruiterApplication | undefined {
  const app = recruiterApplications.find((a) => a.id === id);
  if (app) app.status = status;
  return app;
}

export function updateCompanyStatus(
  id: string,
  status: "approved" | "rejected",
): CompanyApplication | undefined {
  const app = companyApplications.find((a) => a.id === id);
  if (app) app.status = status;
  return app;
}

// Job helpers
export function getAllJobs(): Job[] {
  return jobs;
}

export function getJobById(id: string): Job | undefined {
  return jobs.find((j) => j.id === id);
}

export function createJob(job: Job): void {
  jobs.unshift(job);
}

export function updateJobStatus(
  id: string,
  status: "active" | "closed" | "flagged",
): Job | undefined {
  const job = jobs.find((j) => j.id === id);
  if (job) job.status = status;
  return job;
}

export function getAllJobApplications(): Application[] {
  return jobApplications;
}

export function getApplicationsByUser(userId: string): Application[] {
  return jobApplications.filter((a) => a.userId === userId);
}

export function getApplicationsByJob(jobId: string): Application[] {
  return jobApplications.filter((a) => a.jobId === jobId);
}

export function createJobApplication(app: Application): void {
  jobApplications.push(app);
}

export function getApplicationById(
  id: string,
): Application | undefined {
  return jobApplications.find((a) => a.id === id);
}

export function getJobApplicantsByJobId(jobId: string): JobApplicant[] {
  return jobApplicants[jobId] ?? [];
}

// Connection helpers
export function getConnectionsByUserId(userId: string): Connection[] {
  return connections.filter(
    (c) =>
      (c.userId === userId || c.connectedUserId === userId) &&
      c.status === "accepted",
  );
}

export function findConnection(
  userId: string,
  targetUserId: string,
): Connection | undefined {
  return connections.find(
    (c) =>
      (c.userId === userId && c.connectedUserId === targetUserId) ||
      (c.userId === targetUserId && c.connectedUserId === userId),
  );
}

export function addConnection(conn: Connection): void {
  connections.push(conn);
}

export function getConnectionById(id: string): Connection | undefined {
  return connections.find((c) => c.id === id);
}

// Post helpers
export function getAllPosts(): Post[] {
  return posts;
}

export function createPost(post: Post): void {
  posts.unshift(post);
}

export function getPostById(id: string): Post | undefined {
  return posts.find((p) => p.id === id);
}

export function deletePostById(id: string): boolean {
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  posts.splice(idx, 1);
  return true;
}
