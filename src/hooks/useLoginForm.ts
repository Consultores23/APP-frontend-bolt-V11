import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { validateEmail, validatePassword, ValidationError } from '../utils/validators';
import { supabase } from '../lib/supabase';

interface LoginFormState {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email: ValidationError;
  password: ValidationError;
}

interface UseLoginFormReturn {
  values: LoginFormState;
  errors: LoginFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  validateField: (name: keyof LoginFormState) => void;
}

const useLoginForm = (): UseLoginFormReturn => {
  const navigate = useNavigate();
  const [values, setValues] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<LoginFormErrors>({
    email: null,
    password: null,
  });
  
  const [touched, setTouched] = useState<Record<keyof LoginFormState, boolean>>({
    email: false,
    password: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateField = (name: keyof LoginFormState) => {
    let error: ValidationError = null;
    
    if (name === 'email') {
      error = validateEmail(values.email);
    } else if (name === 'password') {
      error = validatePassword(values.password);
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };
  
  const validateForm = (): boolean => {
    const emailError = validateEmail(values.email);
    const passwordError = validatePassword(values.password);
    
    setErrors({
      email: emailError,
      password: passwordError,
    });
    
    return !emailError && !passwordError;
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name as keyof LoginFormState]) {
      validateField(name as keyof LoginFormState);
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setTouched({
      email: true,
      password: true,
    });
    
    const isValid = validateForm();
    
    if (isValid) {
      setIsSubmitting(true);
      
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          throw error;
        }

        toast.success('¡Bienvenido!');
        navigate('/inicio');
      } catch (error) {
        console.error('Error de inicio de sesión:', error);
        toast.error('Credenciales inválidas');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const isValid = !errors.email && !errors.password && 
                 values.email.length > 0 && values.password.length > 0;
  
  return {
    values,
    errors,
    isSubmitting,
    isValid,
    handleChange,
    handleSubmit,
    validateField,
  };
};

export default useLoginForm;