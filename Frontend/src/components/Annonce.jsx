import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";
import { motion } from "framer-motion";

export default function SuspensionNotice() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full flex justify-center mt-6 px-4"
    >
      <Card className="w-full max-w-2xl bg-yellow-100 border-yellow-400 shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center p-4 border-b border-yellow-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-600 w-6 h-6" />
            <h2 className="text-lg font-semibold text-yellow-800">
              Suspension temporaire des programmes d’inclusion
            </h2>
          </div>
          {/* <button onClick={() => setVisible(false)} className="text-yellow-800 hover:text-yellow-900">
            <X className="w-5 h-5" />
          </button> */}
        </CardHeader>
        <CardContent className="p-4 text-yellow-900">
          <p>
            <strong>Chers partenaires et participants,</strong>
          </p>
          <p className="mt-2">
            Nous souhaitons vous informer que tous les programmes en lien avec l’inclusion des 
            personnes en situation de handicap portés par l’association Gabtrotter sont 
            actuellement suspendus. Cela concerne la formation en langue des signes, 
            l’initiation à l’utilisation de l’outil numérique ainsi que le programme Champion de l’inclusion.
          </p>
          <p className="mt-2">
            Nous remercions chaleureusement tous nos partenaires et participants pour leur 
            patience et leur compréhension. Nous ne manquerons pas de vous tenir informés 
            dès que possible de la reprise de ces initiatives.
          </p>
          <p className="mt-4 font-semibold">
            Merci pour votre engagement et votre soutien.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
