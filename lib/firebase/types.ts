export type UserRole = "student" | "user" | "admin";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  registerNumber?: string;
  createdAt?: string;
  idToken?: string;
  refreshToken?: string;
}

export interface StudentProfile {
  uid: string;
  photoURL: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  dateOfBirth: string;
  college: string;
  usn: string;
  department: string;
  year: string;
  branch: string;
  batch?: string;
  gender: "Male" | "Female" | "Other" | "";
  skills: string[];
  bio: string;
  role: UserRole;
  studentCode?: string;
  avatarPosition?: string;
  avatarRingStyle?: "instagram" | "cyber" | "emerald" | "minimal" | "none";
  projectsCount: number;
  publicationsCount: number;
  followersCount: number;
  profileCompleted: boolean;
  updatedAt?: string;
  createdAt?: string;
  /** Set by the Host/admin panel. Suspended accounts cannot sign in. */
  accountStatus?: "active" | "suspended";
  suspendedReason?: string;
  suspendedAt?: string;
}

export type ProjectCategory =
  | "All"
  | "Web Apps"
  | "Mobile Apps"
  | "AI / ML"
  | "Hardware"
  | "Others";

export type ProjectStatus =
  | "Draft"
  | "Pending review"
  | "Under Review"
  | "Published"
  | "Changes requested"
  | "Rejected"
  | "Archived";

export interface ProjectAuthor {
  name: string;
  avatar: string;
  role: string;
  college: string;
  studentCode?: string;
}

export interface ProjectTeamMember {
  name: string;
  role: string;
  avatar?: string;
  studentCode?: string;
  usn?: string;
  department?: string;
  college?: string;
  isLeader?: boolean;
}

export interface Project {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  image: string;
  tags: string[];
  teamSize: number;
  projectType: string;
  author: ProjectAuthor;
  ownerId?: string;
  ownerCode?: string;
  academicYear?: string;
  batch?: string;
  problemStatement?: string;
  solution?: string;
  features?: string[];
  objectives?: string;
  outcomes?: string;
  methodology?: string;
  challenges?: string;
  futureScope?: string;
  futureEnhancements?: string;
  videoUrl?: string;
  presentationPdfUrl?: string;
  architectureUrl?: string;
  galleryImages?: string[];
  stars?: number;
  views?: number;
  liveUrl?: string;
  githubUrl?: string;
  apkDownloadUrl?: string;
  docsUrl?: string;
  demoUrl?: string;
  featured?: boolean;
  heroVideoImage?: string;
  teamName?: string;
  teamMembers?: ProjectTeamMember[];
  facultyGuide?: string;
  facultyDepartment?: string;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
  /** Latest feedback from the reviewer, shown to the student. */
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewHistory?: Array<{ status: ProjectStatus; note?: string; by: string; at: string }>;
  finalYearProject?: boolean;
}
