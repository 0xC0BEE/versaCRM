// FIX: Corrected import path for types.
import { UserRole, Permissions } from '../types';

export const permissionsByRole: Record<UserRole, Permissions> = {
    'Super Admin': {
        canViewOrganizations: true,
        canEditOrganizations: true,
        canViewAllContacts: true,
        canViewAllReports: true,
        canAccessSettings: true,
    },
    'Organization Admin': {
        canViewOrganizations: false,
        canEditOrganizations: false,
        canViewAllContacts: true,
        canViewAllReports: true,
        canAccessSettings: true,
    },
    'Team Member': {
        canViewOrganizations: false,
        canEditOrganizations: false,
        canViewAllContacts: false, // Can only see assigned contacts - logic to be implemented
        canViewAllReports: false,
        canAccessSettings: false,
    },
    'Client': {
        canViewOrganizations: false,
        canEditOrganizations: false,
        canViewAllContacts: false,
        canViewAllReports: false,
        canAccessSettings: false,
    },
};