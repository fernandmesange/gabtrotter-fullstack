import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, FormEvent } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import axios from 'axios'
import axiosInstance from '@/api/axiosInstance'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/
    return re.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)
    setEmailError('')

    if (!validateEmail(email)) {
      setEmailError('Adresse e-mail invalide')
      setIsLoading(false)
      return
    }

    try {
      const response = await axiosInstance.post(`/auth/forgot-password`, {
        email: email
      })

      setSuccess(true)
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Mot de passe oublié</h1>
          <p className="mt-2 text-sm text-gray-600">
            Entrez votre adresse e-mail pour réinitialiser votre mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Votre email
            </Label>
            <Input
              id="email"
              type="email"
              
              required
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={emailError ? 'true' : 'false'}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
            {emailError && (
              <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{emailError}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Envoi en cours...' : 'Envoyer'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 flex items-center space-x-2 rounded-md bg-red-50 p-4 text-red-800" role="alert">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 flex items-center space-x-2 rounded-md bg-green-50 p-4 text-green-800" role="alert">
            <CheckCircle2 className="h-5 w-5" />
            <p>Un email de réinitialisation de mot de passe vous a été envoyé.</p>
          </div>
        )}
      </div>
    </div>
  )
}