// FIX: Imported the correct Permissions type.
import { Permissions, UserRole, Page } from '../types';

const allPermissions: Permissions = {
    Dashboard: { view: true },
    Organizations: { view: true, create: true, edit: true, delete: true },
    Contacts: { view: true, create: true, edit: true, delete: true },
    Profiles: { view: true, create: true, edit: true, delete: true },
    Interactions: { view: true, create: true, edit: true, delete: true },
    Calendar: { view: true, create: true, edit: true, delete: true },
    Inventory: { view: true, create: true, edit: true, delete: true },
    Reports: { view: true },
    Workflows: { view: true, create: true, edit: true, delete: true },
    Team: { view: true, create: true, edit: true, delete: true },
    Settings: { view: true, edit: true },
    'My Tasks': { view: true, create: true, edit: true, delete: true },
};

export const permissionsByRole: Record<UserRole, Permissions> = {
    'Super Admin': {
        ...allPermissions,
    },
    'Organization Admin': {
        ...allPermissions,
        // FIX: Changed view to true so Org Admins can see their "My Organization" page.
        Organizations: { view: true, create: false, edit: true, delete: false }, 
        Team: { view: true, create: true, edit: true, delete: true },
        Settings: { view: true, edit: true },
    },
    'Team Member': {
        Dashboard: { view: true },
        Organizations: { view: false },
        Contacts: { view: true, create: true, edit: true },
        Profiles: { view: true, create: true, edit: true },
        Interactions: { view: true, create: true, edit: true },
        Calendar: { view: true, create: true, edit: true },
        Inventory: { view: true },
        Reports: { view: false },
        Workflows: { view: false },
        Team: { view: false },
        Settings: { view: false },
        'My Tasks': { view: true, create: true, edit: true, delete: true },
    },
    // FIX: Added permissions for Client role to satisfy the Permissions type.
    'Client': {
        Dashboard: { view: false },
        Organizations: { view: false },
        Contacts: { view: false },
        Profiles: { view: false },
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
