
import {
  Users,
  BarChart3,
  FileText,
  BookOpen,
  Settings,
  Video,
  Home,
} from "lucide-react";
import { UserRole } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  role: UserRole[];
  badge?: string;
  subitems?: NavItem[];
}

export const getNavItems = (role?: string): NavItem[] => [
  {
    label: "Dashboard",
    href: role === "admin"
      ? "/dashboard/admin"
      : role === "manager"
      ? "/dashboard/manager"
      : role === "hr"
      ? "/dashboard/hr"
      : role === "director"
      ? "/dashboard/director"
      : "/dashboard/candidate",
    icon: <Home className="h-5 w-5" />,
    role: ["admin", "manager", "candidate", "hr", "director"],
  },
  {
    label: "Candidates",
    href: "/candidates",
    icon: <Users className="h-5 w-5" />,
    role: ["manager", "hr", "director"],
  },
  {
    label: "Assessments",
    href: "/assessments",
    icon: <FileText className="h-5 w-5" />,
    role: ["admin", "manager", "hr", "director"],
  },
  {
    label: "Interviews",
    href: "/interviews",
    icon: <Video className="h-5 w-5" />,
    role: ["manager", "hr", "director"],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
    role: ["manager", "hr", "director"],
  },
  {
    label: "Training",
    href: "/training",
    icon: <BookOpen className="h-5 w-5" />,
    role: ["candidate"],
  },
  {
    label: "Job Openings",
    href: "/job-openings",
    icon: <FileText className="h-5 w-5" />,
    role: ["candidate"],
  },
  {
    label: "Admin Tools",
    href: "#",
    icon: <Settings className="h-5 w-5" />,
    role: ["admin"],
    subitems: [
      {
        label: "User Management",
        href: "/users",
        icon: <Users className="h-5 w-5" />,
        role: ["admin"],
      },
      {
        label: "Activity Log",
        href: "/activity-log",
        icon: <FileText className="h-5 w-5" />,
        role: ["admin"],
      },
      {
        label: "Training Management",
        href: "/training-management",
        icon: <BookOpen className="h-5 w-5" />,
        role: ["admin"],
      },
    ],
  },
];
