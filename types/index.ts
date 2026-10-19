/**
 * Enterprise Data Models & Type Definitions
 * ProjectHub Platform
 */

export * from "@/lib/firebase/types";

export interface FilterOptions {
  category: string;
  searchQuery: string;
  sortBy?: "recent" | "popular" | "stars";
}

export interface AcademicDepartment {
  id: string;
  name: string;
  shortCode: string;
}
