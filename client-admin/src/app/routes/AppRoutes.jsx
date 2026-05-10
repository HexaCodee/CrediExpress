import { Routes, Route } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { DashboardPage } from '../layouts/DashboardPage.jsx';
import { ProtectedRoutes } from './ProtectedRoutes.jsx';
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx';
import { Users } from '../../features/users/components/Users.jsx';

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
                <Route path='users' element={<Users />} />
            </Route>
        </Routes>
    )
};

