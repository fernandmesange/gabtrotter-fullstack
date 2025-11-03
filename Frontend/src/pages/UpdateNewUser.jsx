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

const UpdateNewUser = () => {
    const { id } = useParams()
    const [fullname, setFullname] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [mobileCode, setMobileCode] = useState(['', '', '', ''])
    const [confirmMobileCode, setConfirmMobileCode] = useState(['', '', '', ''])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const { toast } = useToast()

    const handleMobileCodeChange = (index, value, setter) => {
        if (value.length <= 1 && !isNaN(value)) {
            const newCode = [...(setter === setMobileCode ? mobileCode : confirmMobileCode)]
            newCode[index] = value
            setter(newCode)
            if (value && index < 3) {
                document.getElementById(`code-${setter === setMobileCode ? '' : 'confirm-'}${index + 1}`).focus()
            }
        }
    }

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

        if (mobileCode.join('') !== confirmMobileCode.join('')) {
            toast({
                title: "Erreur",
                description: "Les codes ne correspondent pas.",
                variant: "destructive",
            })
            return
        }

        try {
            const response = await axiosInstance.post("/auth/update-new-user", {
                _id: id,
                fullname,
                password,
                mobileCode: mobileCode.join(''),
            })
            console.log(response.data)
            setSuccess(true)
            toast({
                title: "Succès",
                description: "Votre compte a été correctement configuré",
            })
        } catch (error) {
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
                            <Label htmlFor="fullname">Votre nom complet</Label>
                            <Input id="fullname" type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Votre mot de passe</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer votre mot de passe</Label>
                            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Votre code à quatre chiffres</Label>
                            <div className="flex space-x-2">
                                {mobileCode.map((digit, index) => (
                                    <Input
                                        key={index}
                                        id={`code-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleMobileCodeChange(index, e.target.value, setMobileCode)}
                                        className="w-12 text-center"
                                        required
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Confirmer votre code à quatre chiffres</Label>
                            <div className="flex space-x-2">
                                {confirmMobileCode.map((digit, index) => (
                                    <Input
                                        key={index}
                                        id={`code-confirm-${index}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleMobileCodeChange(index, e.target.value, setConfirmMobileCode)}
                                        className="w-12 text-center"
                                        required
                                    />
                                ))}
                            </div>
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

export default UpdateNewUser