import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, DollarSign, Users } from "lucide-react"
import { useNavigate } from "react-router-dom";

function EventListItem({ event }) {
    const navigate = useNavigate();
    return (
  <Card className="w-full overflow-hidden transition-all hover:shadow-lg">
    <div className="flex flex-col sm:flex-row">
      <div className="relative w-full sm:w-1/3 aspect-video sm:aspect-square">
        <img 
          src={event.image || "/placeholder.svg"} 
          alt={event.title}
          className="object-cover w-full h-full"
        />
        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
          {event.type}
        </Badge>
      </div>
      <div className="flex-1 p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{event.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{new Date(event.startDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{event.maximumPlaces} places</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>{event.isFree ? 'Gratuit' : `${event.price} FCFA`}</span>
          </div>
        </div>
      </div>
    </div>
    <CardFooter className="flex justify-between items-center p-4 bg-muted/50">
      <div>
        {event.isFinance ? (
          <p className="text-sm font-medium">
            Financé par : <span className="font-bold">{event.financeName}</span>
          </p>
        ) : (
          <p className="text-sm font-medium">Organisé par <span className="font-bold">GabTrotter</span></p>
        )}
      </div>
      <Button variant="outline" onClick={() => navigate(`/admin/dashboard/event-management/${event._id}`)}>Gérer</Button>
    </CardFooter>
  </Card>
    );
}
export default EventListItem;