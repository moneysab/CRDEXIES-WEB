import { Role, UserRoles, AdminRoles, ManagerRoles } from 'src/app/theme/shared/components/_helpers/role';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  link?: string;
  description?: string;
  path?: string;
  role?: string[];
  disabled?: boolean;
  resourceId?: string;
  tooltipTitle?: string;
  badge?: { variant: string; text: string };
  isMainParent?: boolean; // specify if item is main parent
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'other',
    title: '',
    type: 'group',
    icon: 'icon-navigation',
    role: [...ManagerRoles.Manager, ...UserRoles.User, ...AdminRoles.Admin],
    children: [
      {
        id: 'sample-page',
        title: 'Home',
        type: 'item',
        url: '/dashboard',
        classes: 'nav-item',
        icon: 'chrome'
      },

      {
        id: 'analytics-dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/analytics',
        icon: 'dashboard',
        classes: 'nav-item premium-feature',
        breadcrumbs: false,
        role: [...ManagerRoles.Manager],
        resourceId: 'analytics',
        tooltipTitle: 'Executive Analytics Dashboard',
        badge: { variant: 'warning', text: 'Premium' }
      },
      {
        id: 'epin-management',
        title: 'C-Flow',
        translate: 'MENU.EPIN_MANAGEMENT',
        type: 'collapse',
        //role: [Role.Manager, Role.User],
        icon: 'credit-card',
        classes: 'edge',
        children: [
          {
            id: 'epin-upload',
            title: 'Upload File',
            type: 'item',
            url: '/epin/upload',
            breadcrumbs: false,
            tooltipTitle: 'Upload EPIN file for processing',
            resourceId: 'epin-processing'
          },
          {
            id: 'visa-cflow',
            title: 'Visa',
            type: 'collapse',
            role: [Role.AdminVisa, Role.ManagerVisa],
            classes: 'edge',
            children: [
              {
                id: 'epin-issuer-kpis',
                title: 'Statistics',
                type: 'item',
                url: '/epin/reports/transactions',
                breadcrumbs: false,
                tooltipTitle: 'View KPIs by issuer',
                resourceId: 'epin-reporting'
              },
              {
                id: 'epin-issuer-kpis',
                title: 'Summary',
                type: 'item',
                url: '/epin/reports/issuer-kpis',
                breadcrumbs: false,
                tooltipTitle: 'View KPIs by issuer',
                resourceId: 'epin-reporting'
              },
    
              {
                id: 'epin-issuer-kpis',
                title: 'Interchange',
                type: 'item',
                url: '/epin/reports/interchange',
                breadcrumbs: false,
                tooltipTitle: 'View Interchange',
                resourceId: 'epin-reporting'
              },
    
              {
                id: 'epin-issuer-kpis',
                title: 'Reimbursement Fee',
                type: 'item',
                url: '/epin/reports/reimbursement',
                breadcrumbs: false,
                tooltipTitle: 'View Reimbursement Fee',
                resourceId: 'epin-reporting'
              },
    
              {
                id: 'epin-issuer-kpis',
                title: 'Charges',
                type: 'item',
                url: '/epin/reports/charges',
                breadcrumbs: false,
                tooltipTitle: 'View Charges',
                resourceId: 'epin-reporting'
              },
             
            ]
          },
          
          {
            id: 'mastercard-cflow',
            title: 'Mastercard',
            type: 'collapse',
            role: [Role.AdminMastercard, Role.ManagerMastercard],
            classes: 'edge',
            children: [
              {
                id: 'mastercard-cflow',
                title: 'Summary',
                type: 'item',
                url: '/ipm/summary',
                breadcrumbs: false,
                tooltipTitle: 'View processing jobs',
                resourceId: 'mastercard-cflow'
              },
              {
                id: 'mastercard-cflow',
                title: 'Transactions',
                type: 'item',
                url: '/ipm/transactions',
                breadcrumbs: false,
                resourceId: 'mastercard-cflow'
              }
            ]
          },
          {
            id: 'epin-jobs',
            title: 'Uploading history',
            type: 'item',
            url: '/epin/jobs',
            breadcrumbs: false,
            tooltipTitle: 'View processing jobs',
            resourceId: 'epin-processing'
          },
        ]
      },
      {
        id: 'visa-management',
        title: 'C-Bill',
        type: 'collapse',
        //role: [...UserRoles.User,...ManagerRoles.Manager, Role.Manager],
        icon: 'credit-card',
        classes: 'edge',
        children: [
          {
            id: 'invoices',
            title: 'Invoices',
            type: 'item',
            url: '/invoices/mastercard/list',
            breadcrumbs: false,
            tooltipTitle: 'View all invoices',
            resourceId: 'visa-invoices'
          },
          {
            id: 'upload',
            title: 'Upload',
            type: 'item',
            url: '/invoices/visa/upload',
            breadcrumbs: false,
            tooltipTitle: 'Upload invoice',
            resourceId: 'visa-invoices'
          },
          {
            id: 'summary',
            title: 'Summary',
            type: 'item',
            url: '/invoices/visa/summary',
            breadcrumbs: false,
            tooltipTitle: 'Summarized invoice data',
            role: [...ManagerRoles.Manager, ...AdminRoles.Admin],
            resourceId: 'visa-invoices'
          },
          {
            id: 'breakdown',
            title: 'Service Breakdown',
            type: 'item',
            url: '/invoices/visa/breakdown',
            breadcrumbs: false,
            tooltipTitle: 'Service-wise breakdown',
            role: [...ManagerRoles.Manager, ...AdminRoles.Admin],
            resourceId: 'visa-invoices'
          },

          {
            id: 'csv-files',
            title: 'Uploading history',
            type: 'item',
            url: '/csv-files',
            classes: 'nav-item history-item',
            breadcrumbs: false,
            tooltipTitle: 'Manage uploaded Invoices',
            resourceId: 'csv-files'
          }
        ]
      },
      {
        id: 'settings-management',
        title: 'Settings',
        type: 'collapse',
        role: [...ManagerRoles.Manager, ...AdminRoles.Admin],
        icon: 'setting',
        classes: 'edge',
        resourceId: 'settings',
        children: [
          {
            id: 'users-section',
            title: 'Users',
            type: 'collapse',
            icon: 'user',
            children: [
              {
                id: 'users-create',
                title: 'Create User',
                type: 'item',
                url: '/create-user',
                classes: 'nav-item users-item',
                breadcrumbs: false,
                tooltipTitle: 'Create User',
                resourceId: 'users-list'
              },
              {
                id: 'users-list',
                title: 'Users List',
                type: 'item',
                url: '/users-list',
                classes: 'nav-item users-item',
                breadcrumbs: false,
                tooltipTitle: 'Users List',
                resourceId: 'users-list'
              },
              {
                id: 'users-acces',
                title: 'Access Control',
                type: 'item',
                url: '/admin/groups',
                classes: 'nav-item users-item',
                breadcrumbs: false,
                tooltipTitle: 'Acess Control',
                resourceId: 'users-acces'
              },
              {
                id: 'actions-follow-up',
                title: 'Audit Trail',
                type: 'item',
                url: '/follow-up',
                classes: 'nav-item users-item',
                breadcrumbs: false,
                tooltipTitle: 'Audit Trail',
                resourceId: 'actions-follow-up'
              },
            ]
          },
          {
            id: 'bank-section',
            title: 'Banks',
            type: 'collapse',
            icon: 'credit-card',
            children: [
              {
                id: 'bank-list',
                title: 'List of Banks',
                type: 'item',
                url: '/bank/list',
                classes: 'nav-item bank-item',
                breadcrumbs: false,
                tooltipTitle: 'List of banks',
                resourceId: 'bank-list'
              },
              {
                id: 'bank-creation',
                title: 'Bank Creation',
                type: 'item',
                url: '/bank/create',
                classes: 'nav-item bank-item',
                breadcrumbs: false,
                tooltipTitle: 'Bank Creation',
                resourceId: 'bank-list'
              },
            ]
          }
        ]
      }
    ]
  }
];
