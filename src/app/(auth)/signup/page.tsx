'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { authAPI } from '@/lib/api/index';
import {SignupForm} from '@/components/signup-form' // adjust default/export if needed

export default function SignupPage() {
  const router = useRouter();

  type SignupData = {
    email: string;
    password: string;
    name?: string;
  };

  const handleSignup = async (data: SignupData) => {
    const response = await authAPI.register(data);
    if (response?.success) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      router.push('/dashboard');
    } else {
      throw new Error(response?.error || 'Signup failed');
    }
  };

  // wrapper to satisfy an onSubmit prop that may accept either a FormEvent or the form data
    const handleSignupSubmit = async (payload: unknown) => {
      // If payload looks like our SignupData, forward it
      if (payload && typeof payload === 'object' && 'email' in payload) {
        await handleSignup(payload as SignupData);
        return;
      }
  
      // If payload is a DOM event, prevent default and no-op (or extract form data if needed)
      const event = payload as React.FormEvent<HTMLFormElement> | undefined;
      event?.preventDefault?.();
      // If your SignupForm doesn't extract and pass SignupData, you can extract fields here from event.target
    };

   return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-6xl">
        <SignupForm  onSubmit={handleSignupSubmit}/>
      </div>
    </div>
  )
}
