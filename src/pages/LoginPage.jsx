import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthProvider"; // 👈 Import du provider

export default function LoginPage() {
  const navigate = useNavigate();
const { login, isAuthenticated, isLoading } = useAuth(); // ⬅️ ajoute isAuthenticated et isLoading



  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
  if (isAuthenticated && !isLoading) {
    navigate("/admin/dashboard");
  }
}, [isAuthenticated, isLoading]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    const result = await login({ email, password }); // 👈 utilisation de login du context

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
    } else {
      setError(result.message);
      setSuccess(false);
    }

    setFormLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-orange-100 p-3">
              <User className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-orange-500">Connexion</CardTitle>
          <CardDescription className="text-center">Entrez vos identifiants pour accéder à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-gray-300 focus-visible:ring-orange-500 focus-visible:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base font-medium">
                  Mot de passe
                </Label>
                <a href="/forgot-password" className="text-sm font-medium text-orange-500 hover:text-orange-600">
                  Mot de passe oublié?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-gray-300 focus-visible:ring-orange-500 focus-visible:border-orange-500"
              />
            </div>

            {success && (
              <Alert className="bg-green-100 text-green-800 border-green-200">
                <AlertDescription>Connexion réussie! Redirection en cours...</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-red-100 text-red-800 border-red-200">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Vous n&apos;avez pas de compte ?{" "}
            <a href="/register" className="font-medium text-orange-500 hover:text-orange-600">
              S&apos;inscrire
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
