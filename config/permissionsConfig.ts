import { Permissions, UserRole } from '../types';

// FIX: Created the permissions configuration file.
export const permissionsByRole: Record<UserRole, Permissions> = {
    'Super Admin': {
        Dashboard: { view: true, create: true, edit: true, delete: true },
        Organizations: { view: true, create: true, edit: true, delete: true },
        Contacts: { view: true, create: true, edit: true, delete: true },
        Interactions: { view: true, create: true, edit: true, delete: true },
        Calendar: { view: true, create: true, edit: true, delete: true },
        Inventory: { view: true, create: true, edit: true, delete: true },
        Reports: { view: true, create: true, edit: true, delete: true },
        Workflows: { view: true, create: true, edit: true, delete: true },
        Team: { view: true, create: true, edit: true, delete: true },
        Settings: { view: true, create: true, edit: true, delete: true },
        'My Tasks': { view: true, create: true, edit: true, delete: true },
    },
    'Organization Admin': {
        Dashboard: { view: true, create: true, edit: true, delete: true },
        Organizations: { view: false }, // Cannot see the list of all orgs
        Contacts: { view: true, create: true, edit: true, delete: true },
        Interactions: { view: true, create: true, edit: true, delete: true },
        Calendar: { view: true, create: true, edit: true, delete: true },
        Inventory: { view: true, create: true, edit: true, delete: true },
        Reports: { view: true, create: true, edit: true, delete: true },
        Workflows: { view: true, create: true, edit: true, delete: true },
        Team: { view: true, create: true, edit: true, delete: true },
        Settings: { view: true, create: true, edit: true, delete: true },
        'My Tasks': { view: true, create: true, edit: true, delete: true }, // Org admins can have tasks too
    },
    'Team Member': {
        Dashboard: { view: true },
        Organizations: { view: false },
        Contacts: { view: true, create: true, edit: true },
        Interactions: { view: true, create: true },
        Calendar: { view: true, create: true, edit: true },
        Inventory: { view: false },
        Reports: { view: false },
        Workflows: { view: false },
        Team: { view: false },
        Settings: { view: false },
        'My Tasks': { view: true, create: true, edit: true, delete: true },
    },
    'Client': {
        // Client portal has its own logic, no permissions needed for the main app pages
        Dashboard: { view: false },
        Organizations: { view: false },
        Contacts: { view: false },
        Interactions: { view: false },
        Calendar: { view: false },
        Inventory: { view: false },
        Reports: { view: false },
        Workflows: { view: false },
        Team: { view: false },
        Settings: { view: false },
        'My Tasks': { view: false },
    },
};