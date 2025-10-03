import { Card } from "@/components/ui/card";
import { Library, Beaker, Palette, Trophy, Laptop, Bus } from "lucide-react";

const Facilities = () => {
  const facilities = [
    {
      icon: Library,
      title: "Well-Stocked Library",
      description: "Extensive collection of books and resources for all age groups"
    },
    {
      icon: Beaker,
      title: "Science Labs",
      description: "Modern laboratories for physics, chemistry, and biology experiments"
    },
    {
      icon: Laptop,
      title: "Computer Labs",
      description: "State-of-the-art computer facilities with high-speed internet"
    },
    {
      icon: Trophy,
      title: "Sports Facilities",
      description: "Playground, indoor games, and professional sports coaching"
    },
    {
      icon: Palette,
      title: "Art & Craft Room",
      description: "Dedicated space for creative expression and artistic development"
    },
    {
      icon: Bus,
      title: "Transport Facility",
      description: "Safe and reliable school transport covering major areas"
    }
  ];

  return (
    <section id="facilities" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            World-Class <span className="text-primary">Facilities</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Modern infrastructure and amenities to support holistic development
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-custom-lg transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-gradient-secondary w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <facility.icon className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{facility.title}</h3>
              <p className="text-muted-foreground">{facility.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facilities;
