// frontend/src/components/pages/LoginPage.tsx
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthCard from '../AuthCard';
import AuthInput from '../AuthInput';
import AuthButton from '../AuthButton';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth

type LoginForm = { email: string; password: string };

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ mode: 'onTouched' });
  
  // Lấy hàm login và trạng thái từ useAuth
  const { login, loginMutation, isAuthenticated, isLoading } = useAuth();

  const onSubmit = (data: LoginForm) => {
    login(data); // Gọi hàm login từ context
  };

  // Nếu đang check auth hoặc đã đăng nhập, điều hướng đi
  if (isLoading) return <div>Đang tải...</div>;
  if (isAuthenticated) return <Navigate to="/homepage" replace />;

  const pending = !!loginMutation?.isPending;

  return (
    <AuthCard
      title="Đăng nhập"
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <AuthInput
          id="email"
          type="email"
          label="Email"
          placeholder="ban@email.com"
          autoComplete="email"
          register={register('email', {
            required: 'Vui lòng nhập email',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email không hợp lệ',
            },
          })}
          errorMessage={errors.email?.message as string}
        />
        <AuthInput
          id="password"
          type="password"
          label="Mật khẩu"
          placeholder="••••••••"
          autoComplete="current-password"
          register={register('password', {
            required: 'Vui lòng nhập mật khẩu',
          })}
          errorMessage={errors.password?.message as string}
        />
        <div className="mt-6">
          <AuthButton disabled={pending} isLoading={pending}>
            Đăng nhập
          </AuthButton>
        </div>
        
        {loginMutation?.isError && (
          <p
            className="mt-4 text-red-600 text-sm text-center"
            role="alert"
            aria-live="assertive"
          >
            {(loginMutation.error as Error)?.message || 'Đăng nhập thất bại'}
          </p>
        )}
      </form>
    </AuthCard>
  );
};

export default LoginPage;