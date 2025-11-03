import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import axiosInstance from '@/api/axiosInstance'

const UpdateUserLandingPage = () => {
    const { id } = useParams()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const { toast } = useToast()


    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess(false)

        if (password !== confirmPassword) {
            toast({
                title: "Erreur",
                description: "Les mots de passe ne correspondent pas.",
                variant: "destructive",
            })
            return
        }

        

        try {
            const response = await axiosInstance.post("/auth/update-subscriber-link", {
                _id: id,
                password,
            })
            console.log(response.data)
            setSuccess(true)

            toast({
                title: "Succès",
                description: "Votre compte a été correctement configuré",
            })
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || "Une erreur est survenue")
            toast({
                title: "Erreur",
                description: error.response?.data?.message || "Une erreur est survenue",
                variant: "destructive",
            })
        }
    }

    return (
        <div className='container mx-auto mt-12 max-w-md'>
            <Card>
                <CardHeader>
                    <CardTitle>Configurer votre compte</CardTitle>
                    <CardDescription>Veuillez remplir les informations suivantes pour finaliser la création de votre compte.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Votre mot de passe</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer votre mot de passe</Label>
                            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        
                    </form>
                </CardContent>
                <CardFooter>
                    <Button type="submit" onClick={handleSubmit} className="w-full">Confirmer</Button>
                </CardFooter>
            </Card>
            {success && (
                <Alert variant="default" className="mt-4">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Succès</AlertTitle>
                    <AlertDescription>
                        Votre compte a été correctement configuré
                    </AlertDescription>
                    <Button variant="outline" className="ml-auto">
                        <a href="/login">Se connecter</a>
                    </Button>
                </Alert>
            )}
            {error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}

export default UpdateUserLandingPage