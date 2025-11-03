import { useState, useEffect } from "react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/api/axiosInstance";

const AgentStats = () => {
    const { userId } = useAuth();
    const [stats, setStats] = useState({ reports: 0, surveyResponses: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(
                `/stats/agent/${userId}`
            );
            setStats(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des statistiques :", error);
            toast({
                title: "Erreur",
                description: "Impossible de charger les statistiques.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="shadow-lg border border-gray-200">
                <CardHeader className="bg-gray-100">
                    <CardTitle className="text-xl font-bold text-gray-700">
                        Mes statistiques
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                        Voici un aperçu de vos performances.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Card className="border border-gray-200 shadow-sm p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-700">
                                    Nombre de rapports envoyés
                                </h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.reports}
                                </p>
                            </Card>
                            <Card className="border border-gray-200 shadow-sm p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-700">
                                    Nombre de réponses collectées
                                </h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.surveyResponses}
                                </p>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AgentStats;
