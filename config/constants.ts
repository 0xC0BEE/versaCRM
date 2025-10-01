import { UserRole } from '../types';

export const USER_ROLES: UserRole[] = ['Super Admin', 'Organization Admin', 'Team Member', 'Client'];

export const QUICK_LOGIN_USERS = [
    { email: 'super@crm.com', label: 'Super Admin' },
    { email: 'admin@crm.com', label: 'Org Admin' },
    { email: 'team@crm.com', label: 'Team Member' },
    { email: 'client@crm.com', label: 'Client Portal' },
];