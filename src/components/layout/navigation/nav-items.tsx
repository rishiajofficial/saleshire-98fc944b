
import { 
  LucideIcon, 
  LayoutDashboard, 
  Users, 
  BriefcaseBusiness,
  FileText,
  UserCircle,
  GraduationCap,
  Building2,
  ClipboardCheck,
  MessagesSquare,
  Calendar,
  BarChart4,
  User,
  Activity,
  Settings,
  Webhook
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  role: string[];
  submenu?: NavItem[];
}

export function getNavItems(role: string | undefined): NavItem[] {
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isHR = role === 'hr';
  const isDirector = role === 'director';
  
  return [
    {
      title: 'Dashboard',
      href: `/dashboard/${role}`,
      icon: LayoutDashboard,
      role: ['admin', 'manager', 'hr', 'director', 'candidate'],
    },
    
    // Admin specific items
    {
      title: 'Admin',
      href: '',
      icon: Settings,
      role: ['admin'],
      submenu: [
        {
          title: 'User Management',
          href: '/admin/users',
          icon: Users,
          role: ['admin'],
        },
        {
          title: 'Companies',
          href: '/admin/companies',
          icon: Building2,
          role: ['admin'],
        },
        {
          title: 'Activity Log',
          href: '/admin/activity-log',
          icon: Activity,
          role: ['admin'],
        },
      ],
    },
    
    // Company admin items (for company admins from any role)
    {
      title: 'Company Management',
      href: '/admin/companies',
      icon: Building2,
      role: ['hr', 'director', 'manager', 'admin'],
    },

    // Manager specific items
    {
      title: 'Candidates',
      href: '/manager/candidates',
      icon: Users,
      role: ['manager', 'hr', 'director'],
    },
    {
      title: 'Applications',
      href: '/manager/applications',
      icon: FileText,
      role: ['manager', 'hr', 'director'],
    },
    {
      title: 'Interviews',
      href: '/manager/interviews',
      icon: Calendar,
      role: ['manager', 'hr', 'director'],
    },
    {
      title: 'Assessments',
      href: '/manager/assessments',
      icon: ClipboardCheck,
      role: ['manager', 'hr'],
    },
    {
      title: 'Analytics',
      href: '/manager/analytics',
      icon: BarChart4,
      role: ['manager', 'hr', 'director'],
    },
    
    // HR specific items
    {
      title: 'Jobs',
      href: '/hr/jobs',
      icon: BriefcaseBusiness,
      role: ['hr', 'admin'],
    },
    
    // Training related items - visible to all roles
    {
      title: 'Training',
      href: '/training',
      icon: GraduationCap,
      role: ['admin', 'manager', 'hr', 'director', 'candidate'],
    },
    
    // Training management - admin & HR only
    {
      title: 'Training Management',
      href: '/admin/training',
      icon: GraduationCap,
      role: ['admin', 'hr'],
    },
    
    // Candidate specific items
    {
      title: 'My Application',
      href: '/application',
      icon: FileText,
      role: ['candidate'],
    },
    {
      title: 'Job Openings',
      href: '/openings',
      icon: BriefcaseBusiness,
      role: ['candidate'],
    },
    
    // Profile - visible to all roles
    {
      title: 'Profile',
      href: '/profile',
      icon: UserCircle,
      role: ['admin', 'manager', 'hr', 'director', 'candidate'],
    },
  ];
}
