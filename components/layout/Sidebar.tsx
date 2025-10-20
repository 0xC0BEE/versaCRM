import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Page, Permission } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
    Home, Building, Users, Briefcase, Inbox, Calendar, BarChart2, Settings, Package, Handshake,
    LifeBuoy, Zap, Mails, ClipboardList, BookOpen, LayoutTemplate, Bot, HelpCircle, Shapes, FileText, FolderKanban, History, MessageSquare, Bell, ChevronDown, ScanSearch
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import * as LucideIcons from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

interface NavItem {
    page: Page;
    icon: React.ElementType;
    label?: string;
    permission?: Permission;
    isSuperAdminOnly?: boolean;
    customObjectDefId?: string;
    tourId?: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}


const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { currentPage, setCurrentPage, industryConfig, setCurrentCustomObjectDefId, openSections, setOpenSections } = useApp();
    const { hasPermission, authenticatedUser } = useAuth();
    const { customObjectDefsQuery } = useData();
    const { unreadCount } = useNotifications();
    const { data: customObjectDefs = [] } = customObjectDefsQuery;

    const toggleSection = (title: string) => {
        setOpenSections(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const handleNavigation = (page: Page, customObjectDefId?: string) => {
        setCurrentPage(page);
        if (customObjectDefId) {
            setCurrentCustomObjectDefId(customObjectDefId);
        } else {
            setCurrentCustomObjectDefId(null);
        }
        if (window.innerWidth < 1024) {
            setIsOpen(false);
        }
        
        // Auto-open the section containing the navigated item
        const section = navSections.find(s => s.items.some(i => i.page === page && i.customObjectDefId === customObjectDefId));
        if (section) {
            setOpenSections(prev => ({ ...prev, [section.title]: true }));
        }
    };

    const isSuperAdmin = authenticatedUser?.roleId === 'role_super';

    const customNavSection: NavSection | null = customObjectDefs.length > 0 ? {
        title: 'Custom',
        items: customObjectDefs.map((def: any) => ({
            page: 'CustomObjects',
            icon: (LucideIcons as any)[def.icon] || Shapes,
            label: def.namePlural,
            customObjectDefId: def.id
        }))
    } : null;

    let navSections: NavSection[] = [
        {
            title: 'Core',
            items: [
                { page: 'Dashboard', icon: Home, permission: 'contacts:read:own' },
                { page: 'Notifications', icon: Bell, permission: 'contacts:read:own' },
                { page: 'Inbox', icon: Inbox, permission: 'contacts:read:own' },
                { page: 'TeamChat', icon: MessageSquare, label: 'Team Chat', permission: 'contacts:read:own' },
                { page: 'Contacts', icon: Users, label: industryConfig.contactNamePlural, permission: 'contacts:read:own', tourId: 'sidebar-contacts' },
                { page: 'Deals', icon: Handshake, permission: 'deals:read' },
                { page: 'Tasks', icon: Briefcase, permission: 'contacts:read:own' },
                { page: 'Calendar', icon: Calendar, permission: 'contacts:read:own' },
            ]
        },
    ];

    if (customNavSection) {
        navSections.push(customNavSection);
    }

    navSections = navSections.concat([
        {
            title: 'Business',
            items: [
                { page: 'Projects', icon: FolderKanban, permission: 'deals:read' },
                { page: 'Tickets', icon: LifeBuoy, permission: 'tickets:read' },
                { page: 'Campaigns', icon: Zap, permission: 'automations:manage' },
                { page: 'AudienceProfiles', icon: ScanSearch, label: 'Audience Profiles', permission: 'automations:manage' },
                { page: 'Forms', icon: ClipboardList, permission: 'automations:manage' },
                { page: 'LandingPages', icon: LayoutTemplate, permission: 'automations:manage' },
                { page: 'Documents', icon: FileText, permission: 'deals:read' },
                { page: 'Workflows', icon: Bot, permission: 'automations:manage' },
                { page: 'Interactions', icon: History, permission: 'contacts:read:all' },
                { page: 'SyncedEmail', icon: Mails, permission: 'contacts:read:all' },
                { page: 'Inventory', icon: Package, permission: 'inventory:read' },
            ]
        },
        {
            title: 'Analytics',
            items: [
                { page: 'Reports', icon: BarChart2, permission: 'reports:read' },
            ]
        },
         {
            title: 'Developer',
            items: [
                { page: 'ApiDocs', icon: BookOpen, permission: 'settings:manage:api' },
            ]
        },
        {
            title: 'Resources',
            items: [
                { page: 'KnowledgeBase', icon: HelpCircle, label: 'Help & KB' },
            ]
        },
        {
            title: 'Admin',
            items: [
                { page: 'Team', icon: Users, permission: 'settings:manage:team' },
                { page: 'AppMarketplace', icon: Shapes, label: 'App Marketplace', permission: 'settings:manage:apps'},
                { page: 'Settings', icon: Settings, permission: 'settings:access', tourId: 'sidebar-settings' },
                 { page: 'Organizations', icon: Building, isSuperAdminOnly: true },
            ]
        }
    ]);

    return (
        <div className={`flex flex-col flex-shrink-0 w-64 h-full bg-card-bg border-r border-border-subtle transition-all duration-300`}>
            <div className="h-16 flex items-center justify-center flex-shrink-0 px-4">
                <h1 className="text-2xl font-bold text-text-primary">VersaCRM</h1>
            </div>
            <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Sidebar">
                <div className="p-2">
                    {navSections.map(section => {
                        const accessibleItems = section.items.filter((item: NavItem) => {
                            if (item.isSuperAdminOnly) return isSuperAdmin;
                            
                            const requiredPermission = item.permission as Permission;
                            if (!requiredPermission) return true;

                            if (hasPermission(requiredPermission)) return true;
                            
                            if (requiredPermission.endsWith(':own') && hasPermission(requiredPermission.replace(':own', ':all') as Permission)) {
                                return true;
                            }

                            return false;
                        });
                        if (accessibleItems.length === 0) return null;

                        return (
                            <div key={section.title} className="mb-2">
                                <button onClick={() => toggleSection(section.title)} className="w-full flex justify-between items-center px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider rounded-md hover:bg-hover-bg">
                                    <span>{section.title}</span>
                                    <ChevronDown size={16} className={`transition-transform ${openSections[section.title] ? 'rotate-180' : ''}`} />
                                </button>
                                {openSections[section.title] && (
                                    <div className="mt-1 space-y-1 animate-fade-in-up" style={{animationDuration: '0.3s'}}>
                                        {accessibleItems.map((item: NavItem) => (
                                            <button
                                                key={item.label || item.page}
                                                onClick={() => handleNavigation(item.page, item.customObjectDefId)}
                                                data-tour-id={item.tourId}
                                                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left ${
                                                    (currentPage === item.page && (!item.customObjectDefId || item.customObjectDefId === (useApp().currentCustomObjectDefId)))
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-text-secondary hover:bg-hover-bg'
                                                }`}
                                            >
                                                <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${(currentPage === item.page && (!item.customObjectDefId || item.customObjectDefId === (useApp().currentCustomObjectDefId))) ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'}`} aria-hidden="true" />
                                                <span className="flex-1">{item.label || item.page}</span>
                                                {item.page === 'Notifications' && unreadCount > 0 && (
                                                    <span className="ml-auto inline-block py-0.5 px-2 text-xs font-semibold rounded-full bg-primary text-white">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;