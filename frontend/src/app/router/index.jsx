import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Auth Pages
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RegisterPage } from '../../features/auth/pages/RegisterPage';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '../../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../features/auth/pages/ResetPasswordPage';

// Dashboard & Accounts Pages
import { DashboardIndex } from '../../features/accounts/pages/DashboardIndex';
import { MyAccountsPage } from '../../features/accounts/pages/MyAccountsPage';
import { CreateAccountPage } from '../../features/accounts/pages/CreateAccountPage';

// Transactions Pages
import { TransferPage } from '../../features/transactions/pages/TransferPage';
import { DepositWithdrawalPage } from '../../features/transactions/pages/DepositWithdrawalPage';
import { TransactionHistoryPage } from '../../features/transactions/pages/TransactionHistoryPage';

const Placeholder = ({ name }) => (
  <div className="bank-card">
    <h2 className="text-2xl mb-4">{name}</h2>
    <p className="text-text-secondary">Esta página está en construcción para la siguiente fase.</p>
  </div>
);

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardIndex /> },
      { path: 'profile', element: <Placeholder name="Profile Page" /> },
      { path: 'accounts', element: <MyAccountsPage /> },
      { path: 'accounts/new', element: <CreateAccountPage /> },
      { path: 'transfer', element: <TransferPage /> },
      { path: 'withdrawals', element: <DepositWithdrawalPage /> },
      { path: 'deposits', element: <DepositWithdrawalPage /> },
      { path: 'history', element: <TransactionHistoryPage /> },
      { path: 'history/:accountId', element: <TransactionHistoryPage /> },
      { path: 'services', element: <Placeholder name="Services Page" /> },
      { path: 'redeems', element: <Placeholder name="My Redeems" /> },
      { path: 'favorites', element: <Placeholder name="Favorites" /> },
      
      // Admin only routes
      { 
        path: 'admin/users', 
        element: (
          <ProtectedRoute allowedRoles={['ADMIN_ROLE']}>
            <Placeholder name="Users Management" />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'admin/requests', 
        element: (
          <ProtectedRoute allowedRoles={['ADMIN_ROLE']}>
            <Placeholder name="Account Requests" />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'admin/accounts', 
        element: (
          <ProtectedRoute allowedRoles={['ADMIN_ROLE']}>
            <Placeholder name="All Accounts" />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'admin/services', 
        element: (
          <ProtectedRoute allowedRoles={['ADMIN_ROLE']}>
            <Placeholder name="Services Management" />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'admin/reports', 
        element: (
          <ProtectedRoute allowedRoles={['ADMIN_ROLE']}>
            <Placeholder name="Reports" />
          </ProtectedRoute>
        ) 
      },
    ]
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> }
]);
