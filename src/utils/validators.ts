export type ValidationError = string | null;

export const validateEmail = (email: string): ValidationError => {
  if (!email) return 'El correo electrónico es obligatorio';
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return 'Correo electrónico inválido';
  }
  
  return null;
};

export const validatePassword = (password: string): ValidationError => {
  if (!password) return 'La contraseña es obligatoria';
  
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  
  return null;
};