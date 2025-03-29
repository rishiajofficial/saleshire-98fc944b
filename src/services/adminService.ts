
import { ServiceResponse } from './baseService';
import { ContentService } from './contentService';
import { UserService } from './userService';

// Re-export types for backward compatibility
export type AdminServiceResponse = ServiceResponse;
export type { ContentData } from './contentService';
export type { UserData } from './userService';

// Admin service that combines all services for backward compatibility
export const AdminService = {
  // Content management functions
  createContent: ContentService.createContent,
  updateContent: ContentService.updateContent,
  deleteContent: ContentService.deleteContent,
  getAssessmentResults: ContentService.getAssessmentResults,
  
  // User management functions
  createUser: UserService.createUser,
  updateUser: UserService.updateUser,
  deleteUser: UserService.deleteUser,
  getUser: UserService.getUser
};

export default AdminService;
