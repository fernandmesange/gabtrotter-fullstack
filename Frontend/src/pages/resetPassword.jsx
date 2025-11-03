import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import axios from 'axios'
import axiosInstance from '@/api/axiosInstance'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(false)

  useEffect(() => {
    verifyPasswordToken()
  }, [])

  const verifyPasswordToken = async () => {
    try {
      await axiosInstance.post(`/auth/verify-password-token`, {
        token,
        email
      })
      setIsTokenValid(true)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Token invalide ou expiré')
      } else {
        setError('Une erreur est survenue lors de la vérification du token')
      }
      setIsTokenValid(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setIsLoading(false)
      return
    }

    if (password.length < 4) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setIsLoading(false)
      return
    }

    try {
      await axiosInstance.post(`/auth/reset-password`, {
        email: email,
        password,
        token
      })
      setSuccess(true)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Impossible de modifier votre mot de passe')
      } else {
        setError('Une erreur est survenue lors de la réinitialisation du mot de passe')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isTokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600">Lien invalide</h1>
            <p className="mt-2 text-sm text-gray-600">
              {error || 'Le lien de réinitialisation du mot de passe est invalide ou a expiré.'}
            </p>
          </div>
          <Button asChild className="w-full">
            <a href="/forgot-password">Demander un nouveau lien</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Définissez votre nouveau mot de passe</h1>
          <p className="mt-2 text-sm text-gray-600">
            Choisissez un nouveau mot de passe sécurisé pour votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Votre nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmez votre nouveau mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={4}
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Modification en cours...' : 'Modifier mon mot de passe'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 flex items-center space-x-2 rounded-md bg-red-50 p-4 text-red-800" role="alert">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2 rounded-md bg-green-50 p-4 text-green-800" role="alert">
              <CheckCircle2 className="h-5 w-5" />
              <p>Votre mot de passe a bien été modifié</p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <a href="/">Me connecter</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}