import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { useToast } from '@/context/ToastContext';

const registerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['administrador', 'gerente', 'residente', 'tecnico']),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [error, setError] = React.useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    // Pass the selected role to the registration function
    const result = await registerUser(data.email, data.password, data.name, data.role);
    
    if (result.success) {
      addToast('Cuenta creada exitosamente', 'success');
      // If auto-confirm is enabled in Supabase, user is logged in.
      // If not, they might need to confirm email. 
      // For this MVP we assume auto-confirm or we redirect to login telling them to check email.
      // But typically Supabase signUp returns session if auto-confirm is on.
      // Let's redirect to dashboard if session exists, or login if not.
      // Since AuthContext listens to state change, if session is created, user will be set.
      navigate('/app/dashboard');
    } else {
      setError(result.error || 'Error al registrarse');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-primary-600 dark:text-primary-500 font-bold">Crear Cuenta</CardTitle>
          <p className="text-center text-gray-500 dark:text-gray-400">Únete a ConstruLab SaaS</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}
            
            <Input
              label="Nombre Completo"
              placeholder="Juan Pérez"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="juan@ejemplo.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rol / Puesto</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('role')}
              >
                <option value="tecnico">Técnico de Laboratorio</option>
                <option value="residente">Residente de Obra</option>
                <option value="gerente">Gerente de Calidad</option>
                <option value="administrador">Administrador del Sistema</option>
              </select>
              {errors.role && (
                <p className="text-xs text-red-500">{errors.role.message}</p>
              )}
            </div>
            
            <Input
              label="Contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="******"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirmar Contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="******"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Registrarse
            </Button>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                Inicia Sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
