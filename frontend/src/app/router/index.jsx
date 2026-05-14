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
import { FavoritesPage } from '../../features/accounts/pages/FavoritesPage';

// Transactions Pages
import { TransferPage } from '../../features/transactions/pages/TransferPage';
import { DepositWithdrawalPage } from '../../features/transactions/pages/DepositWithdrawalPage';
import { TransactionHistoryPage } from '../../features/transactions/pages/TransactionHistoryPage';

// Services Pages
import { ServicesCatalogPage } from '../../features/services/pages/ServicesCatalogPage';
import { MyRedeemsPage } from '../../features/services/pages/MyRedeemsPage';

// Admin Pages
import { UsersManagementPage } from '../../features/admin/pages/UsersManagementPage';
import { AccountRequestsPage } from '../../features/admin/pages/AccountRequestsPage';
import { AdminAccountsPage } from '../../features/admin/pages/AdminAccountsPage';
import { AdminServicesPage } from '../../features/admin/pages/AdminServicesPage';

// Profile Page
import { ProfilePage } from '../../features/profile/pages/ProfilePage';

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
            { path: 'profile', element: <ProfilePage /> },
            { path: 'accounts', element: <MyAccountsPage /> },
            { path: 'accounts/new', element: <CreateAccountPage /> },
            { path: 'transfer', element: <TransferPage /> },
            { path: 'withdrawals', element: <DepositWithdrawalPage /> },
            { path: 'deposits', element: <DepositWithdrawalPage /> },
            { path: 'history', element: <TransactionHistoryPage /> },
            { path: 'history/:accountId', element: <TransactionHistoryPage /> },
            { path: 'services', element: <ServicesCatalogPage /> },
            { path: 'redeems', element: <MyRedeemsPage /> },
            { path: 'favorites', element: <FavoritesPage /> },

            // Admin only routes
            {
                path: 'admin/users',
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN_ROLE']}>
                        <UsersManagementPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin/requests',
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN_ROLE']}>
                        <AccountRequestsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin/accounts',
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN_ROLE']}>
                        <AdminAccountsPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'admin/services',
                element: (
                    <ProtectedRoute allowedRoles={['ADMIN_ROLE']}>
                        <AdminServicesPage />
                    </ProtectedRoute>
                )
            },
        ]
    },
    { path: '*', element: <Navigate to="/dashboard" replace /> }
]);
