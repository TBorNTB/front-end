// types/pages/auth.ts - Page-specific types
import { LoginFormData, SignupFormData } from '@/features/auth/types';

export interface AuthPageProps {
  mode: 'login' | 'signup' | 'forgot-password' | 'reset-password';
  redirectUrl?: string;
  
  loginProps?: {
    initialValues?: Partial<LoginFormData>;
    socialProviders: SocialProvider[];
  };

  signupProps?: {
    initialValues?: Partial<SignupFormData>;
    termsUrl: string;
    privacyUrl: string;
  };

  resetProps?: {
    token?: string;
    email?: string;
  };
}

interface SocialProvider {
  provider: 'github';
  enabled: boolean;
  redirectUrl: string;
}
