'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { LoginForm } from '@/components/User/login-form' // 👈 import your component
import { useNotification } from '@/hooks/useNotification'

export default function LoginPage() {
  const router = useRouter()
  const notify = useNotification()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authAPI.login(email, password)
      if (response.success) {
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        notify.success('Login Successful', 'Welcome back!', 2000)
        router.push('/dashboard')
      } else {
        const errorMsg = response.error || 'the login failed'
        setError(errorMsg)
        notify.loginFailed(errorMsg)
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred during login'
      setError(errorMsg)
      notify.loginFailed(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center  p-4">
      <LoginForm
        onSubmit={handleSubmit}
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}
