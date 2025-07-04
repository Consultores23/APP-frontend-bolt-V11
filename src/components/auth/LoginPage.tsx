import React from 'react';
import LoginForm from './LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-900 to-dark-800 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-secondary-500 rounded-lg mb-4 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-white"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-secondary-500">COnsultores</h2>
      </div>

      <div className="w-full max-w-md bg-dark-800 border border-dark-700 rounded-xl p-6 sm:p-8 shadow-xl">
        <LoginForm />
      </div>

      <p className="mt-8 text-sm text-gray-500">
        © {new Date().getFullYear()} COnsultores. Todos los derechos reservados.
      </p>
    </div>
  );
};

export default LoginPage;
