import React from 'react';
import { AuthScreen } from '../auth/AuthScreen';

interface StudentLoginProps {
  onLoginSuccess?: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onLoginSuccess }) => {
  return <AuthScreen initialRole="student" onSuccess={onLoginSuccess} />;
};
