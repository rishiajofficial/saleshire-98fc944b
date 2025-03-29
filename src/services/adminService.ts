
import { ServiceResponse } from './baseService';
import { ContentData, ContentService } from './contentService';
import { UserData, UserService } from './userService';

// Re-export types for backward compatibility
export type AdminServiceResponse = ServiceResponse;
export { ContentData, UserData };

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
