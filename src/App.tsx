// frontend/src/App.tsx
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom';

import HomePage from '@/components/pages/HomePage';
import LoginPage from '@/components/pages/LoginPage';
import SignUpPage from '@/components/pages/SignUpPage';

// Import AuthProvider và các component mới
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

// Layout mới, sử dụng hook useAuth
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth(); // Lấy state từ context

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
              >
                RegisterApp (JWT)
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/homepage"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>

                {/* Right-side (auth-aware) */}
                {isAuthenticated && user ? (
                  <>
                    <span className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700">
                      {user.email}
                    </span>
                    <button
                      onClick={logout} // Dùng hàm logout từ context
                      className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main
        className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        {children}
      </main>
    </div>
  );
};

// Component App chính đã được bọc QueryClientProvider ở main.tsx
// Chúng ta chỉ cần bọc AuthProvider ở đây.
export default function App() {
  return (
    <BrowserRouter basename="/IA03-User-Registration-API-with-React-Frontend-frontend">
      <AuthProvider>
        {' '}
        {/* Bọc AuthProvider */}
        <Layout>
          <Routes>
            {/* Route công khai */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Route được bảo vệ */}
            <Route path="/" element={<ProtectedRoute />}>
              {/* Use relative child routes so protection applies */}
              <Route index element={<Navigate to="homepage" replace />} />
              <Route path="homepage" element={<HomePage />} />
              {/* Thêm các route bảo vệ khác tại đây */}
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}