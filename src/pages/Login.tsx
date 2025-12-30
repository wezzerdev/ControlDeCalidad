import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = React.useState('');
  
  // Get redirect path from state or default to dashboard
  const from = location.state?.from?.pathname || '/app/dashboard';

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
        navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-primary-600 dark:text-primary-500 font-bold">ConstruLab SaaS</CardTitle>
          <p className="text-center text-gray-500 dark:text-gray-400">Ingresa a tu cuenta para continuar</p>
          {location.state?.from && (
             <p className="text-center text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded mt-2">
                 Debes iniciar sesión para acceder a esa página.
             </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}
            
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="admin@laboratorio.com"
              error={errors.email?.message}
              {...register('email')}
            />
            
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="******"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Iniciar Sesión
            </Button>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                Regístrate
              </Link>
            </div>
            <div className="text-center text-xs text-gray-400 mt-4 space-y-1">
                <p>Credenciales Demo:</p>
                <p>admin@laboratorio.com / password123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
