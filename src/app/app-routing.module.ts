// angular import
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project import
import { AdminLayout } from './theme/layout/admin-layout/admin-layout.component';
import { GuestLayouts } from './theme/layout/guest-layout/guest-layout.component';
import { authGuardFn } from './core/authentication/auth.guard';
import { noAuthGuardFn } from './core/authentication/no-auth.guard';

// Define which paths should redirect to login when accessed while not authenticated
const securedPaths = [
  '/dashboard',
  '/invoices',
  '/csv-files',
  '/profile',
  '/sample-page',
  '/epin'
];

const routes: Routes = [
  // Guest routes should be placed BEFORE admin routes to ensure proper prioritization
  {
    path: '',
    component: GuestLayouts,
    children: [
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        canActivate: [noAuthGuardFn],
        loadComponent: () => import('./features/auth/login/login.component').then((c) => c.LoginComponent)
      },
      {
        path: 'register',
        canActivate: [noAuthGuardFn],
        loadComponent: () => import('./features/auth/signup/signup.component').then((c) => c.SignupComponent)
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify-email/verify-email.component').then((c) => c.VerifyEmailComponent)
      },
      {
        path: 'reset-password',
        canActivate: [noAuthGuardFn],
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then((c) => c.ResetPasswordComponent)
      },
      {
        path: 'request-password-reset',
        canActivate: [noAuthGuardFn],
        loadComponent: () => import('./features/auth/request-password-reset/request-password-reset.component').then((c) => c.RequestPasswordResetComponent)
      }
    ]
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuardFn],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/user-profile/user-profile.component').then((c) => c.UserProfileComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./features/user-change-password/user-change-password.component').then((c) => c.UserChangePasswordComponent)
      },
      {
        path: 'invoices',
        children: [
          {
            path: 'visa',
            children: [
              {
                path: 'list',
                loadComponent: () => import('./features/invoices/visa/visa-invoice-list/visa-invoice-list.component').then((c) => c.VisaInvoiceListComponent)
              },
              {
                path: 'upload',
                loadComponent: () => import('./features/invoices/visa/visa-invoice-upload/visa-invoice-upload.component').then((c) => c.VisaInvoiceUploadComponent)
              },
              {
                path: 'summary',
                loadComponent: () => import('./features/invoices/visa/visa-summary/visa-summary.component').then((c) => c.VisaSummaryComponent)
              },
              {
                path: 'breakdown',
                loadComponent: () => import('./features/invoices/visa/visa-breakdown/visa-breakdown.component').then((c) => c.VisaBreakdownComponent)
              },
              {
                path: 'list/:id',
                loadComponent: () => import('./features/invoices/visa/visa-invoice-detail/visa-invoice-detail.component').then((c) => c.VisaInvoiceDetailComponent)
              },


              // {
              //   path: 'summary',
              //   loadComponent: () => import('./features/invoices/visa/visa-summary/visa-summary.component').then((c) => c.VisaSummaryComponent)
              // },
              // {
              // path: 'breakdown',
              //loadComponent: () => import('./features/invoices/visa/visa-summary/visa-summary.component').then((c) => c.VisaSummaryComponent)
              //}
            ]
          },
          {
            path: 'mastercard',
            children: [
              {
                path: 'list',
                loadComponent: () => import('./features/invoices/mastercard/mastercard-invoice-list/mastercard-invoice-list.component').then((c) => c.MastercardInvoiceListComponent)
              },
              {
                path: 'upload',
                loadComponent: () => import('./features/invoices/mastercard/mastercard-invoice-upload/mastercard-invoice-upload.component').then((c) => c.MastercardInvoiceUploadComponent)
              },
              {
                path: 'summary',
                loadComponent: () => import('./features/invoices/mastercard/mastercard-summary/mastercard-summary.component').then((c) => c.MastercardSummaryComponent)
              },
              {
                path: 'breakdown',
                loadComponent: () => import('./features/invoices/mastercard/mastercard-breakdown/mastercard-breakdown.component').then((c) => c.MastercardBreakdownComponent)
              },
              {
                path: 'list/:id',
                loadComponent: () => import('./features/invoices/mastercard/mastercard-invoice-detail/mastercard-invoice-detail.component').then((c) => c.MastercardInvoiceDetailComponent)
              },
              //{
              //path: 'csv-upload',
              //loadComponent: () => import('./features/invoices/mastercard/mastercard-invoice-upload/mastercard-invoice-upload.component').then((c) => c.MastercardInvoiceUploadComponent)
              //},

            ]
          }
        ]
      },
      {
        path: 'csv-files',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/csv/csv-file-list/csv-file-list.component').then((c) => c.CsvFileListComponent)
          },
          {
            path: 'visa/:csvName',
            loadComponent: () => import('./features/csv/visa-csv-detail/visa-csv-detail.component').then((c) => c.VisaCsvDetailComponent)
          },
          {
            path: 'mastercard/:csvName',
            loadComponent: () => import('./features/csv/mastercard-csv-detail/mastercard-csv-detail.component').then((c) => c.MastercardCsvDetailComponent)
          }

        ]
      },
      /*
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin-home/admin-home.component').then(m => m.AdminHomeComponent),
      },
      */
      {
        path : 'admin/groups',
        loadComponent:() => import('./features/admin/groups-list/groups-list.component').then((c) => c.GroupsListComponent),
      },
      {
        path : 'admin/roles',
        loadComponent:() => import('./features/admin/roles-list/roles-list.component').then((c) => c.RolesListComponent),
      },
      {
        path: 'analytics',
        loadChildren: () => import('./features/analytics/analytics.module').then(m => m.AnalyticsModule)
      },
      {
        path: 'anomalies/visa/detail/:id',
        loadComponent: () =>
          import('./features/analytics/visa-anomaly-detail/visa-anomaly-detail.component') .then(m => m.VisaAnomalyDetailComponent)
      },
      {
        path: 'anomalies/mastercard/detail/:id',
        loadComponent: () =>
          import('./features/analytics/mastercard-anomaly-detail/mastercard-anomaly-detail.component') .then(m => m.MastercardAnomalyDetailComponent)
      },
      {
        path: 'follow-up',
        loadComponent: () => import('./features/user-follow-up/user-follow-up.component').then(m => m.UserFollowUpComponent)
      },
      {
        path: 'users-list',
        loadComponent: () => import('./features/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path:'create-user',
        loadComponent: () => import('./features/user-create/user-create.component').then((c) => c.UserCreateComponent)
      },
      { path: 'user-update/:id', 
        loadComponent: () => import('./features/users-update/users-update.component').then((c) => c.UserUpdateComponent)},

      {
        path: 'bank',
        children: [
          {
            path: 'list',
            loadComponent: () => import('./features/bank-info/bank-info-list/bank-info-list.component').then(m => m.BankInfoListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./features/bank-info/bank-info-creation/bank-info-creation.component').then(m => m.BankInfoCreationComponent)
          },
          {
            path: 'list/:id',
            loadComponent: () => import('./features/bank-info/bank-info-update/bank-info-update.component').then(m => m.BankInfoUpdateComponent)
          }
        ]
      },
      {
        path: 'epin',
        children: [
          {
            path: 'upload',
            loadComponent: () => import('./features/epin/file-processing/epin-upload/epin-upload.component').then((c) => c.EpinUploadComponent)
          },
          {
            path: 'jobs',
            loadComponent: () => import('./features/epin/file-processing/epin-jobs/epin-jobs.component').then((c) => c.EpinJobsComponent)
          },
          {
            path: 'jobs/:jobId',
            loadComponent: () => import('./features/epin/file-processing/epin-job-detail/epin-job-detail.component').then((c) => c.EpinJobDetailComponent)
          },
          {
            path: 'stats',
            loadComponent: () => import('./features/epin/file-processing/epin-stats/epin-stats.component').then((c) => c.EpinStatsComponent)
          },
          {
            path: 'reports/issuer-kpis',
            loadComponent: () => import('./features/epin/reporting/issuer-kpis/issuer-kpis.component').then((c) => c.IssuerKpisComponent)
          },
          {
            path: 'reports/interchange',
            loadComponent: () => import('./features/epin/reporting/interchange-repport/interchange-repport.component').then((c) => c.InterchangeRepportComponent)
          },
          {
            path: 'reports/reimbursement',
            loadComponent: () => import('./features/epin/reporting/reimbursement-report/reimbursement-report.component').then((c) => c.ReimbursementReportComponent)
          },
          {
            path: 'reports/charges',
            loadComponent: () => import('./features/epin/reporting/charges-report/charges-report.component').then((c) => c.ChargesReportComponent)
          },
          {
            path: 'reports/country-channel-revenues',
            loadComponent: () => import('./features/epin/reporting/country-channel-revenues/country-channel-revenues.component').then((c) => c.CountryChannelRevenuesComponent)
          },
          {
            path: 'reports/bin-revenues',
            loadComponent: () => import('./features/epin/reporting/bin-revenues/bin-revenues.component').then((c) => c.BinRevenuesComponent)
          },
          {
            path: 'reports/export',
            loadComponent: () => import('./features/epin/reporting/export-reports/export-reports.component').then((c) => c.ExportReportsComponent)
          },
          {
            path: 'reports/transactions',
            loadComponent: () => import('./features/epin/reporting/transactions-report/transactions-report.component').then((c) => c.TransactionsReportComponent)
          },
          {
            path: 'reports/transactions/detail',
            loadComponent: () => import('./features/epin/reporting/transactions-detail/transactions-detail.component').then((c) => c.TransactionsDetailComponent)
          }
        ]
      },
      {
        path:'ipm',
        children: [
          {
            path:'upload',
            loadComponent: () => import('./features/ipm/ipm-upload/ipm-upload.component').then((c) => c.IpmUploadComponent)
          },
          {
            path:'summary',
            loadComponent: () => import('./features/ipm/ipm-summary/ipm-summary.component').then((c) => c.IpmSummaryComponent)
          },
          {
            path: 'summary/:id',
            loadComponent: () => import('./features/ipm/ipm-summary-detail/ipm-summary-detail.component').then((c) => c.IpmSummaryDetailComponent)
          },
          {
           path: 'transactions',
           loadComponent: () => import('./features/ipm/ipm-transactions/ipm-transactions.component').then((c) => c.IpmTransactionsComponent)
          },
          {
            path: 'transactions/:id',
            loadComponent: () => import('./features/ipm/ipm-transactions-detail/ipm-transactions-detail.component').then((c) => c.IpmTransactionsDetailComponent)
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }