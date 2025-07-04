import React, { useRef } from 'react';
import { Mail, Lock } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useLoginForm from '../../hooks/useLoginForm';

const LoginForm: React.FC = () => {
  const { values, errors, isSubmitting, isValid, handleChange, handleSubmit, validateField } = useLoginForm();
  const passwordRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Iniciar sesión</h1>
        <p className="text-gray-400">Ingresa tus datos para acceder a la plataforma</p>
      </div>
      
      <Input
        label="Correo electrónico"
        name="email"
        type="email"
        placeholder="correo@ejemplo.com"
        value={values.email}
        onChange={handleChange}
        onBlur={() => validateField('email')}
        error={errors.email}
        icon={<Mail size={18} />}
        autoComplete="email"
        autoFocus
      />
      
      <Input
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        value={values.password}
        onChange={handleChange}
        onBlur={() => validateField('password')}
        error={errors.password}
        icon={<Lock size={18} />}
        ref={passwordRef}
        autoComplete="current-password"
      />
      
      <div className="mt-8">
        <Button 
          type="submit" 
          fullWidth 
          size="lg" 
          isLoading={isSubmitting}
          disabled={isSubmitting || !isValid}
        >
          Iniciar sesión
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;