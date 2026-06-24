// Persistent data store backed by Supabase.
// All functions are async — tRPC routes call them with await.

import { supabase } from "../../lib/supabase";

// ── TypeScript interfaces (camelCase, matching the app) ────────────

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

// ── DB ↔ App mappers ─────────────────────────────────────────────

function dbUserToApp(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    type: row.type as User["type"],
    fullName: (row.full_name as string) ?? undefined,
    companyName: (row.company_name as string) ?? undefined,
    phoneNumber: (row.phone_number as string) ?? undefined,
    country: (row.country as string) ?? undefined,
    profilePicture: (row.profile_picture as string) ?? undefined,
    bio: (row.bio as string) ?? undefined,
    skills: (row.skills as string[]) ?? undefined,
    experience: (row.experience as string) ?? undefined,
    education: (row.education as string) ?? undefined,
    isPremium: (row.is_premium as boolean) ?? undefined,
    isAdmin: (row.is_admin as boolean) ?? undefined,
    connections: (row.connections as string[]) ?? undefined,
  };
}

function dbUserToAuthUser(row: Record<string, unknown>): AuthUser {
  return {
    ...dbUserToApp(row),
    password: row.password as string,
  };
}

function appUserToDb(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    name: user.name,
    type: user.type,
    full_name: user.fullName ?? null,
    company_name: user.companyName ?? null,
    phone_number: user.phoneNumber ?? null,
    country: user.country ?? null,
    profile_picture: user.profilePicture ?? null,
    bio: user.bio ?? null,
    skills: user.skills ?? null,
    experience: user.experience ?? null,
    education: user.education ?? null,
    is_premium: user.isPremium ?? false,
    is_admin: user.isAdmin ?? false,
    connections: user.connections ?? [],
  } as const;
}

function dbProToApp(row: Record<string, unknown>): ProfessionalApplication {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? "",
    location: (row.location as string) ?? "",
    title: (row.title as string) ?? "",
    experience: (row.experience as string) ?? "",
    skills: (row.skills as string[]) ?? [],
    status: row.status as ProfessionalApplication["status"],
    createdAt: (row.created_at as string) ?? "",
  };
}

function dbRecruiterToApp(row: Record<string, unknown>): RecruiterApplication {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string) ?? "",
    company: (row.company as string) ?? "",
    location: (row.location as string) ?? "",
    status: row.status as RecruiterApplication["status"],
    createdAt: (row.created_at as string) ?? "",
  };
}

function dbCompanyToApp(row: Record<string, unknown>): CompanyApplication {
  return {
    id: row.id as string,
    companyName: row.company_name as string,
    contactPerson: (row.contact_person as string) ?? "",
    email: row.email as string,
    phone: (row.phone as string) ?? "",
    location: (row.location as string) ?? "",
    industry: (row.industry as string) ?? "",
    website: (row.website as string) ?? "",
    registrationNumber: (row.registration_number as string) ?? "",
    status: row.status as CompanyApplication["status"],
    createdAt: (row.created_at as string) ?? "",
  };
}

function dbJobToApp(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    title: row.title as string,
    company: row.company as string,
    companyLogo: (row.company_logo as string) ?? undefined,
    location: (row.location as string) ?? "",
    type: row.type as Job["type"],
    salary: (row.salary as string) ?? undefined,
    description: (row.description as string) ?? "",
    requirements: (row.requirements as string[]) ?? [],
    postedBy: row.posted_by as string,
    postedAt: new Date((row.posted_at as string) ?? Date.now()),
    applicants: (row.applicants as number) ?? 0,
    status: row.status as Job["status"],
  };
}

function dbApplicationToApp(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    jobId: row.job_id as string,
    userId: row.user_id as string,
    coverLetter: (row.cover_letter as string) ?? "",
    resume: (row.resume as string) ?? undefined,
    appliedAt: new Date((row.applied_at as string) ?? Date.now()),
    status: row.status as Application["status"],
  };
}

function dbConnectionToApp(row: Record<string, unknown>): Connection {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    connectedUserId: row.connected_user_id as string,
    status: row.status as Connection["status"],
    createdAt: new Date((row.created_at as string) ?? Date.now()),
  };
}

function dbPostToApp(row: Record<string, unknown>): Post {
  const author = (row.author as Record<string, unknown>) ?? {};
  return {
    id: row.id as string,
    authorId: row.author_id as string,
    author: {
      id: (author.id as string) ?? "",
      name: (author.name as string) ?? "",
      title: (author.title as string) ?? "",
      profilePicture: (author.profilePicture as string) ?? undefined,
      isVerified: (author.isVerified as boolean) ?? undefined,
    },
    content: row.content as string,
    image: (row.image as string) ?? undefined,
    timestamp: (row.timestamp as string) ?? "",
    createdAt: new Date((row.created_at as string) ?? Date.now()),
    likes: (row.likes as number) ?? 0,
    comments: (row.comments as number) ?? 0,
    shares: (row.shares as number) ?? 0,
    likedBy: (row.liked_by as string[]) ?? [],
  };
}

function dbJobApplicantToApp(row: Record<string, unknown>): JobApplicant {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    title: (row.title as string) ?? "",
    appliedAt: (row.applied_at as string) ?? "",
    status: row.status as JobApplicant["status"],
  };
}

// ── Seed data ────────────────────────────────────────────────────

const SEED_PROFESSIONALS: ProfessionalApplication[] = [
  {
    id: "1", name: "Amara Okonkwo", email: "amara.okonkwo@email.com",
    phone: "+234 80 123 4567", location: "Lagos, Nigeria",
    title: "Senior Software Engineer", experience: "8 years",
    skills: ["React Native", "TypeScript", "Node.js", "AWS"],
    status: "pending", createdAt: "2025-01-12T10:30:00Z",
  },
  {
    id: "2", name: "Kwame Mensah", email: "kwame.mensah@email.com",
    phone: "+233 24 555 1234", location: "Accra, Ghana",
    title: "Product Designer", experience: "5 years",
    skills: ["UI/UX", "Figma", "Prototyping", "Design Systems"],
    status: "pending", createdAt: "2025-01-11T14:20:00Z",
  },
  {
    id: "3", name: "Sarah Kimani", email: "sarah.kimani@email.com",
    phone: "+254 70 555 9012", location: "Nairobi, Kenya",
    title: "Data Scientist", experience: "6 years",
    skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
    status: "approved", createdAt: "2025-01-10T09:15:00Z",
  },
];

const SEED_RECRUITERS: RecruiterApplication[] = [
  {
    id: "1", name: "John Osei", email: "john.osei@techcorp.com",
    phone: "+233 24 777 8888", company: "TechCorp Africa",
    location: "Accra, Ghana", status: "pending", createdAt: "2025-01-11T11:30:00Z",
  },
  {
    id: "2", name: "Grace Mwangi", email: "grace.m@innovate.co.ke",
    phone: "+254 70 888 9999", company: "Innovate Kenya",
    location: "Nairobi, Kenya", status: "pending", createdAt: "2025-01-10T15:45:00Z",
  },
];

const SEED_COMPANIES: CompanyApplication[] = [
  {
    id: "1", companyName: "Tech Africa Solutions", contactPerson: "Kwame Mensah",
    email: "hr@techafricasolutions.com", phone: "+233 24 555 1234",
    location: "Accra, Ghana", industry: "Technology",
    website: "www.techafricasolutions.com", registrationNumber: "BN20231234",
    status: "pending", createdAt: "2025-01-10T10:30:00Z",
  },
  {
    id: "2", companyName: "AfriBank Financial", contactPerson: "Amara Okafor",
    email: "recruitment@afribank.com", phone: "+234 80 555 5678",
    location: "Lagos, Nigeria", industry: "Finance",
    website: "www.afribank.com", registrationNumber: "RC45678",
    status: "pending", createdAt: "2025-01-11T14:20:00Z",
  },
];

const SEED_JOBS: Job[] = [
  {
    id: "1", title: "Senior Software Engineer", company: "TechCorp Africa",
    location: "Lagos, Nigeria", type: "Full-time", salary: "$60,000 - $90,000",
    description: "We are seeking a talented Senior Software Engineer to join our growing team.",
    requirements: ["5+ years experience", "React Native", "Node.js"],
    postedBy: "recruiter1", postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    applicants: 45, status: "active",
  },
  {
    id: "2", title: "Product Designer", company: "DesignHub",
    location: "Accra, Ghana", type: "Remote", salary: "$40,000 - $60,000",
    description: "Looking for a creative Product Designer to help shape our products.",
    requirements: ["3+ years experience", "Figma", "User Research"],
    postedBy: "company1", postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    applicants: 28, status: "active",
  },
];

const SEED_JOB_APPLICANTS: Record<string, JobApplicant[]> = {
  "1": [
    { id: "a1", name: "John Doe", email: "john.doe@email.com", title: "Senior Developer", appliedAt: "2025-01-10T14:30:00Z", status: "pending" },
    { id: "a2", name: "Jane Smith", email: "jane.smith@email.com", title: "Full Stack Engineer", appliedAt: "2025-01-09T10:20:00Z", status: "shortlisted" },
    { id: "a3", name: "Michael Brown", email: "michael.b@email.com", title: "React Native Developer", appliedAt: "2025-01-08T16:45:00Z", status: "pending" },
  ],
};

let seeded = false;

/** Seeds the database with initial demo data if tables are empty. */
export async function seedDatabase(): Promise<void> {
  if (seeded) return;
  try {
    // Check if data already exists
    const { count: proCount } = await supabase
      .from("professional_applications")
      .select("*", { count: "exact", head: true });
    if (proCount && proCount > 0) { seeded = true; return; }

    // Seed professionals
    for (const p of SEED_PROFESSIONALS) {
      await supabase.from("professional_applications").insert({
        id: p.id, name: p.name, email: p.email, phone: p.phone,
        location: p.location, title: p.title, experience: p.experience,
        skills: p.skills, status: p.status, created_at: p.createdAt,
      });
    }

    // Seed recruiters
    for (const r of SEED_RECRUITERS) {
      await supabase.from("recruiter_applications").insert({
        id: r.id, name: r.name, email: r.email, phone: r.phone,
        company: r.company, location: r.location, status: r.status,
        created_at: r.createdAt,
      });
    }

    // Seed companies
    for (const c of SEED_COMPANIES) {
      await supabase.from("company_applications").insert({
        id: c.id, company_name: c.companyName, contact_person: c.contactPerson,
        email: c.email, phone: c.phone, location: c.location,
        industry: c.industry, website: c.website,
        registration_number: c.registrationNumber, status: c.status,
        created_at: c.createdAt,
      });
    }

    // Seed jobs
    for (const j of SEED_JOBS) {
      await supabase.from("jobs").insert({
        id: j.id, title: j.title, company: j.company, location: j.location,
        type: j.type, salary: j.salary, description: j.description,
        requirements: j.requirements, posted_by: j.postedBy,
        posted_at: j.postedAt.toISOString(), applicants: j.applicants,
        status: j.status,
      });
    }

    // Seed job applicants
    for (const [jobId, applicants] of Object.entries(SEED_JOB_APPLICANTS)) {
      for (const a of applicants) {
        await supabase.from("job_applicants").insert({
          id: a.id, job_id: jobId, name: a.name, email: a.email,
          title: a.title, applied_at: a.appliedAt, status: a.status,
        });
      }
    }

    console.log("[data-store] Seeded database with demo data");
  } catch (err) {
    console.error("[data-store] Seed error (non-fatal):", err);
  }

  // Always ensure admin users exist so admin login works
  try {
    const adminUsers = [
      {
        id: "admin-seed-001",
        email: "admin@talentbridge.com",
        password: "hashed_admin123",
        name: "Administrator",
        type: "admin",
        is_admin: true,
        is_premium: false,
      },
      {
        id: "admin-seed-002",
        email: "bridge.gh@talentbridge.com",
        password: "hashed_bridge123",
        name: "Bridge Admin",
        type: "admin",
        is_admin: true,
        is_premium: false,
      },
    ];
    for (const admin of adminUsers) {
      const { error: upsertErr } = await supabase
        .from("auth_users")
        .upsert(admin, { onConflict: "id" });
      if (upsertErr) {
        console.error(`[data-store] Admin upsert error for ${admin.email}:`, upsertErr);
      }
    }
    console.log("[data-store] Ensured admin users exist");
  } catch (adminErr) {
    console.error("[data-store] Admin seed error:", adminErr);
  }

  seeded = true;
}

// ── Auth helpers ─────────────────────────────────────────────────

export async function getAuthUser(id: string): Promise<AuthUser | undefined> {
  const { data } = await supabase.from("auth_users").select("*").eq("id", id).single();
  return data ? dbUserToAuthUser(data) : undefined;
}

export async function getAuthUserByEmail(email: string): Promise<AuthUser | undefined> {
  const { data } = await supabase
    .from("auth_users")
    .select("*")
    .ilike("email", email)
    .single();
  return data ? dbUserToAuthUser(data) : undefined;
}

export async function createAuthUser(user: AuthUser): Promise<void> {
  await supabase.from("auth_users").insert(appUserToDb(user));
}

// ── User helpers ─────────────────────────────────────────────────

export async function getUsersForSearch(): Promise<User[]> {
  const { data } = await supabase.from("auth_users").select("*");
  if (!data) return [];
  return data.map((r) => dbUserToApp(r));
}

export async function getUserById(id: string): Promise<User | undefined> {
  const { data } = await supabase.from("auth_users").select("*").eq("id", id).single();
  return data ? dbUserToApp(data) : undefined;
}

// ── Admin helpers ────────────────────────────────────────────────

export async function getAllProfessionalApplications(): Promise<ProfessionalApplication[]> {
  const { data } = await supabase.from("professional_applications").select("*").order("created_at", { ascending: false });
  if (!data) return [];
  return data.map(dbProToApp);
}

export async function getAllRecruiterApplications(): Promise<RecruiterApplication[]> {
  const { data } = await supabase.from("recruiter_applications").select("*").order("created_at", { ascending: false });
  if (!data) return [];
  return data.map(dbRecruiterToApp);
}

export async function getAllCompanyApplications(): Promise<CompanyApplication[]> {
  const { data } = await supabase.from("company_applications").select("*").order("created_at", { ascending: false });
  if (!data) return [];
  return data.map(dbCompanyToApp);
}

export async function createProfessionalApplication(
  app: ProfessionalApplication,
): Promise<void> {
  await supabase.from("professional_applications").insert({
    id: app.id,
    name: app.name,
    email: app.email,
    phone: app.phone,
    location: app.location,
    title: app.title,
    experience: app.experience,
    skills: app.skills,
    status: app.status,
    created_at: app.createdAt,
  });
}

export async function updateProfessionalStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<ProfessionalApplication | undefined> {
  const { data } = await supabase
    .from("professional_applications")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  return data ? dbProToApp(data) : undefined;
}

export async function createRecruiterApplication(
  app: RecruiterApplication,
): Promise<void> {
  await supabase.from("recruiter_applications").insert({
    id: app.id,
    name: app.name,
    email: app.email,
    phone: app.phone,
    company: app.company,
    location: app.location,
    status: app.status,
    created_at: app.createdAt,
  });
}

export async function updateRecruiterStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<RecruiterApplication | undefined> {
  const { data } = await supabase
    .from("recruiter_applications")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  return data ? dbRecruiterToApp(data) : undefined;
}

export async function createCompanyApplication(
  app: CompanyApplication,
): Promise<void> {
  await supabase.from("company_applications").insert({
    id: app.id,
    company_name: app.companyName,
    contact_person: app.contactPerson,
    email: app.email,
    phone: app.phone,
    location: app.location,
    industry: app.industry,
    website: app.website,
    registration_number: app.registrationNumber,
    status: app.status,
    created_at: app.createdAt,
  });
}

export async function updateCompanyStatus(
  id: string,
  status: "approved" | "rejected",
): Promise<CompanyApplication | undefined> {
  const { data } = await supabase
    .from("company_applications")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  return data ? dbCompanyToApp(data) : undefined;
}

// ── Job helpers ──────────────────────────────────────────────────

export async function getAllJobs(): Promise<Job[]> {
  const { data } = await supabase.from("jobs").select("*").order("posted_at", { ascending: false });
  if (!data) return [];
  return data.map(dbJobToApp);
}

export async function getJobById(id: string): Promise<Job | undefined> {
  const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
  return data ? dbJobToApp(data) : undefined;
}

export async function createJob(job: Job): Promise<void> {
  await supabase.from("jobs").insert({
    id: job.id,
    title: job.title,
    company: job.company,
    company_logo: job.companyLogo ?? null,
    location: job.location,
    type: job.type,
    salary: job.salary ?? null,
    description: job.description,
    requirements: job.requirements,
    posted_by: job.postedBy,
    posted_at: job.postedAt.toISOString(),
    applicants: job.applicants,
    status: job.status,
  });
}

export async function updateJobStatus(
  id: string,
  status: "active" | "closed" | "flagged",
): Promise<Job | undefined> {
  const { data } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  return data ? dbJobToApp(data) : undefined;
}

export async function incrementJobApplicants(id: string): Promise<void> {
  const { data: job } = await supabase
    .from("jobs")
    .select("applicants")
    .eq("id", id)
    .single();
  const current = (job?.applicants as number) ?? 0;
  await supabase
    .from("jobs")
    .update({ applicants: current + 1 })
    .eq("id", id);
}

export async function getAllJobApplications(): Promise<Application[]> {
  const { data } = await supabase.from("job_applications").select("*").order("applied_at", { ascending: false });
  if (!data) return [];
  return data.map(dbApplicationToApp);
}

export async function getApplicationsByUser(userId: string): Promise<Application[]> {
  const { data } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", userId)
    .order("applied_at", { ascending: false });
  if (!data) return [];
  return data.map(dbApplicationToApp);
}

export async function getApplicationsByJob(jobId: string): Promise<Application[]> {
  const { data } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_id", jobId)
    .order("applied_at", { ascending: false });
  if (!data) return [];
  return data.map(dbApplicationToApp);
}

export async function createJobApplication(app: Application): Promise<void> {
  await supabase.from("job_applications").insert({
    id: app.id,
    job_id: app.jobId,
    user_id: app.userId,
    cover_letter: app.coverLetter,
    resume: app.resume ?? null,
    applied_at: app.appliedAt.toISOString(),
    status: app.status,
  });
}

export async function getApplicationById(id: string): Promise<Application | undefined> {
  const { data } = await supabase.from("job_applications").select("*").eq("id", id).single();
  return data ? dbApplicationToApp(data) : undefined;
}

export async function getJobApplicantsByJobId(jobId: string): Promise<JobApplicant[]> {
  const { data } = await supabase
    .from("job_applicants")
    .select("*")
    .eq("job_id", jobId)
    .order("applied_at", { ascending: false });
  if (!data) return [];
  return data.map(dbJobApplicantToApp);
}

// ── Connection helpers ───────────────────────────────────────────

export async function getConnectionsByUserId(userId: string): Promise<Connection[]> {
  const { data } = await supabase
    .from("connections")
    .select("*")
    .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
    .eq("status", "accepted");
  if (!data) return [];
  return data.map(dbConnectionToApp);
}

export async function findConnection(
  userId: string,
  targetUserId: string,
): Promise<Connection | undefined> {
  const { data } = await supabase
    .from("connections")
    .select("*")
    .or(
      `and(user_id.eq.${userId},connected_user_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},connected_user_id.eq.${userId})`,
    )
    .maybeSingle();
  return data ? dbConnectionToApp(data) : undefined;
}

export async function addConnection(conn: Connection): Promise<void> {
  await supabase.from("connections").insert({
    id: conn.id,
    user_id: conn.userId,
    connected_user_id: conn.connectedUserId,
    status: conn.status,
    created_at: conn.createdAt.toISOString(),
  });
}

export async function getConnectionById(id: string): Promise<Connection | undefined> {
  const { data } = await supabase.from("connections").select("*").eq("id", id).single();
  return data ? dbConnectionToApp(data) : undefined;
}

// ── Message helpers ──────────────────────────────────────────────

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: Date;
  jobTitle?: string;
}

function dbMessageToApp(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    senderId: row.sender_id as string,
    recipientId: row.recipient_id as string,
    content: row.content as string,
    createdAt: new Date((row.created_at as string) ?? Date.now()),
    read: (row.read as boolean) ?? false,
  };
}

function dbConversationToApp(row: Record<string, unknown>): Conversation {
  return {
    id: row.id as string,
    participantIds: (row.participant_ids as string[]) ?? [],
    lastMessage: (row.last_message as string) ?? "",
    lastMessageAt: new Date((row.last_message_at as string) ?? Date.now()),
    jobTitle: (row.job_title as string) ?? undefined,
  };
}

export async function getConversationsByUser(userId: string): Promise<Conversation[]> {
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .contains("participant_ids", [userId])
    .order("last_message_at", { ascending: false });
  if (!data) return [];
  return data.map(dbConversationToApp);
}

export async function getMessagesByConversation(conversationId: string): Promise<Message[]> {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (!data) return [];
  return data.map(dbMessageToApp);
}

export async function sendMessage(msg: Message): Promise<void> {
  await supabase.from("messages").insert({
    id: msg.id,
    conversation_id: msg.conversationId,
    sender_id: msg.senderId,
    recipient_id: msg.recipientId,
    content: msg.content,
    created_at: msg.createdAt.toISOString(),
    read: msg.read,
  });
  await supabase
    .from("conversations")
    .update({
      last_message: msg.content,
      last_message_at: msg.createdAt.toISOString(),
    })
    .eq("id", msg.conversationId);
}

export async function createConversation(conv: Conversation): Promise<void> {
  await supabase.from("conversations").insert({
    id: conv.id,
    participant_ids: conv.participantIds,
    last_message: conv.lastMessage,
    last_message_at: conv.lastMessageAt.toISOString(),
    job_title: conv.jobTitle ?? null,
  });
}

export async function getConversationById(id: string): Promise<Conversation | undefined> {
  const { data } = await supabase.from("conversations").select("*").eq("id", id).single();
  return data ? dbConversationToApp(data) : undefined;
}

// ── Notification helpers ──────────────────────────────────────────

export interface AppNotification {
  id: string;
  userId: string;
  type: "like" | "comment" | "connection" | "job";
  title: string;
  description: string;
  createdAt: Date;
  read: boolean;
  relatedId?: string;
}

function dbNotificationToApp(row: Record<string, unknown>): AppNotification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    type: row.type as AppNotification["type"],
    title: row.title as string,
    description: row.description as string,
    createdAt: new Date((row.created_at as string) ?? Date.now()),
    read: (row.read as boolean) ?? false,
    relatedId: (row.related_id as string) ?? undefined,
  };
}

export async function getNotificationsByUser(userId: string): Promise<AppNotification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (!data) return [];
  return data.map(dbNotificationToApp);
}

export async function createNotification(notif: AppNotification): Promise<void> {
  await supabase.from("notifications").insert({
    id: notif.id,
    user_id: notif.userId,
    type: notif.type,
    title: notif.title,
    description: notif.description,
    created_at: notif.createdAt.toISOString(),
    read: notif.read,
    related_id: notif.relatedId ?? null,
  });
}

export async function markNotificationsRead(userId: string): Promise<void> {
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

// ── Calls helpers ─────────────────────────────────────────────────

export interface ScheduledCall {
  id: string;
  callerId: string;
  recipientId: string;
  recipientName: string;
  type: "audio" | "video";
  status: "scheduled" | "completed" | "missed" | "canceled";
  scheduledAt: Date;
  duration?: string;
  jobTitle?: string;
}

function dbCallToApp(row: Record<string, unknown>): ScheduledCall {
  return {
    id: row.id as string,
    callerId: row.caller_id as string,
    recipientId: row.recipient_id as string,
    recipientName: (row.recipient_name as string) ?? "",
    type: row.type as ScheduledCall["type"],
    status: row.status as ScheduledCall["status"],
    scheduledAt: new Date((row.scheduled_at as string) ?? Date.now()),
    duration: (row.duration as string) ?? undefined,
    jobTitle: (row.job_title as string) ?? undefined,
  };
}

export async function getCallsByUser(userId: string): Promise<ScheduledCall[]> {
  const { data } = await supabase
    .from("scheduled_calls")
    .select("*")
    .or(`caller_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("scheduled_at", { ascending: true });
  if (!data) return [];
  return data.map(dbCallToApp);
}

export async function createScheduledCall(call: ScheduledCall): Promise<void> {
  await supabase.from("scheduled_calls").insert({
    id: call.id,
    caller_id: call.callerId,
    recipient_id: call.recipientId,
    recipient_name: call.recipientName,
    type: call.type,
    status: call.status,
    scheduled_at: call.scheduledAt.toISOString(),
    duration: call.duration ?? null,
    job_title: call.jobTitle ?? null,
  });
}

// ── Payment Config helpers ──────────────────────────────────────

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branchCode?: string;
  swiftCode?: string;
}

export interface MobileMoneyAccount {
  provider: string; // e.g. "MTN", "Vodafone", "AirtelTigo"
  number: string;
  accountName: string;
}

export interface PaymentConfig {
  id: string;
  operationalAccount: BankAccount;
  profitAccount: BankAccount;
  mobileMoneyAccounts: MobileMoneyAccount[];
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  amountUSD: number;
  amountLocal: string;
  currencyCode: string;
  paymentMethod: "mobile_money" | "bank_transfer" | "debit_card";
  status: "pending" | "completed" | "failed" | "refunded";
  details: string; // JSON with payment-specific details
  createdAt: string;
}

function dbPaymentConfigToApp(row: Record<string, unknown>): PaymentConfig {
  const opAcc = (row.operational_account as Record<string, unknown>) ?? {};
  const profitAcc = (row.profit_account as Record<string, unknown>) ?? {};
  return {
    id: row.id as string,
    operationalAccount: {
      bankName: (opAcc.bank_name as string) ?? "",
      accountNumber: (opAcc.account_number as string) ?? "",
      accountHolder: (opAcc.account_holder as string) ?? "",
      branchCode: (opAcc.branch_code as string) ?? undefined,
      swiftCode: (opAcc.swift_code as string) ?? undefined,
    },
    profitAccount: {
      bankName: (profitAcc.bank_name as string) ?? "",
      accountNumber: (profitAcc.account_number as string) ?? "",
      accountHolder: (profitAcc.account_holder as string) ?? "",
      branchCode: (profitAcc.branch_code as string) ?? undefined,
      swiftCode: (profitAcc.swift_code as string) ?? undefined,
    },
    mobileMoneyAccounts: ((row.mobile_money_accounts as Record<string, unknown>[]) ?? []).map((m: Record<string, unknown>) => ({
      provider: (m.provider as string) ?? "",
      number: (m.number as string) ?? "",
      accountName: (m.account_name as string) ?? "",
    })),
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
  };
}

function dbTransactionToApp(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    userEmail: (row.user_email as string) ?? "",
    userName: (row.user_name as string) ?? "",
    planId: (row.plan_id as string) ?? "",
    planName: (row.plan_name as string) ?? "",
    amountUSD: (row.amount_usd as number) ?? 0,
    amountLocal: (row.amount_local as string) ?? "",
    currencyCode: (row.currency_code as string) ?? "USD",
    paymentMethod: row.payment_method as Transaction["paymentMethod"],
    status: row.status as Transaction["status"],
    details: (row.details as string) ?? "{}",
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}

export async function getPaymentConfig(): Promise<PaymentConfig | null> {
  const { data } = await (supabase as any)
    .from("payment_config")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  return data ? dbPaymentConfigToApp(data) : null;
}

export async function savePaymentConfig(config: Omit<PaymentConfig, "id" | "updatedAt">): Promise<PaymentConfig> {
  const id = "config-001";
  const now = new Date().toISOString();
  await (supabase as any).from("payment_config").upsert({
    id,
    operational_account: {
      bank_name: config.operationalAccount.bankName,
      account_number: config.operationalAccount.accountNumber,
      account_holder: config.operationalAccount.accountHolder,
      branch_code: config.operationalAccount.branchCode ?? null,
      swift_code: config.operationalAccount.swiftCode ?? null,
    },
    profit_account: {
      bank_name: config.profitAccount.bankName,
      account_number: config.profitAccount.accountNumber,
      account_holder: config.profitAccount.accountHolder,
      branch_code: config.profitAccount.branchCode ?? null,
      swift_code: config.profitAccount.swiftCode ?? null,
    },
    mobile_money_accounts: config.mobileMoneyAccounts.map((m) => ({
      provider: m.provider,
      number: m.number,
      account_name: m.accountName,
    })),
    updated_at: now,
  }, { onConflict: "id" });
  return { id, ...config, updatedAt: now };
}

export async function getAllTransactions(limit = 50): Promise<Transaction[]> {
  const { data } = await (supabase as any)
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!data) return [];
  return data.map(dbTransactionToApp);
}

export async function createTransaction(tx: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
  const id = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  await (supabase as any).from("transactions").insert({
    id,
    user_id: tx.userId,
    user_email: tx.userEmail,
    user_name: tx.userName,
    plan_id: tx.planId,
    plan_name: tx.planName,
    amount_usd: tx.amountUSD,
    amount_local: tx.amountLocal,
    currency_code: tx.currencyCode,
    payment_method: tx.paymentMethod,
    status: tx.status,
    details: tx.details,
    created_at: now,
  });
  return { id, ...tx, createdAt: now };
}

export async function updateTransactionStatus(
  id: string,
  status: Transaction["status"],
): Promise<boolean> {
  const { error } = await (supabase as any)
    .from("transactions")
    .update({ status })
    .eq("id", id);
  return !error;
}

// ── Post helpers ─────────────────────────────────────────────────

export async function getAllPosts(): Promise<Post[]> {
  const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  if (!data) return [];
  return data.map(dbPostToApp);
}

export async function createPost(post: Post): Promise<void> {
  await supabase.from("posts").insert({
    id: post.id,
    author_id: post.authorId,
    author: post.author as unknown as Record<string, unknown>,
    content: post.content,
    image: post.image ?? null,
    timestamp: post.timestamp,
    created_at: post.createdAt.toISOString(),
    likes: post.likes,
    comments: post.comments,
    shares: post.shares,
    liked_by: post.likedBy,
  });
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const { data } = await supabase.from("posts").select("*").eq("id", id).single();
  return data ? dbPostToApp(data) : undefined;
}

export async function deletePostById(id: string): Promise<boolean> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    console.error("[data-store] Delete post error:", error.message);
    return false;
  }
  return true;
}
