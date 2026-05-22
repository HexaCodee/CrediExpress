import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { DashboardPage } from '../layouts/DashboardPage.jsx';
import { UserPanel } from '../../features/auth/components/UserPanel.jsx';
import { ProfilePage } from '../../features/auth/pages/ProfilePage.jsx';
import { HomePage } from '../../features/auth/pages/HomePage.jsx';
import { TransactionsPage } from '../../features/auth/pages/TransactionsPage.jsx';
import { ProtectedRoutes } from './ProtectedRoutes.jsx';
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx';
import { Users } from '../../features/users/components/Users.jsx';
import { CurrencyConversionPage } from '../../features/conversion/pages/CurrencyConversionPage.jsx';
import { BankAccountsPage } from '../../features/bank/pages/BankAccountsPage.jsx';
import { RoleGuard } from './RoleGuard.jsx';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<AuthPage />} />
            <Route path='/unauthorized' element={<UnauthorizedPage />} />
            <Route
                path='/dashboard/*'
                element={
                    <ProtectedRoutes>
                        <DashboardPage />
                    </ProtectedRoutes>
                }
            >
                <Route index element={<Navigate to='home' replace />} />
                <Route path='home' element={<HomePage />} />
                <Route path='users' element={<Users />} />
                <Route path='user' element={<UserPanel />} />
                <Route path='home' element={<HomePage />} />
                <Route path='profile' element={<ProfilePage />} />
                <Route path='loans' element={<TransactionsPage />} />
                <Route
                    path='bank-accounts'
                    element={
                        <RoleGuard allowedRoles={['BANK_ADMIN']}>
                            <BankAccountsPage />
                        </RoleGuard>
                    }
                />
                <Route
                    path='conversion'
                    element={
                        <RoleGuard allowedRoles={['USER_ROLE', 'CLIENT']}>
                            <CurrencyConversionPage />
                        </RoleGuard>
                    }
                />
            </Route>
        </Routes>
    )
};

