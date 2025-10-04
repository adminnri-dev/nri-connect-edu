import { Card } from "@/components/ui/card";

const Gallery = () => {
  const images = [
    {
      src: "/placeholder.svg",
      title: "Modern Classrooms",
      category: "Infrastructure"
    },
    {
      src: "/placeholder.svg",
      title: "Science Laboratory",
      category: "Facilities"
    },
    {
      src: "/placeholder.svg",
      title: "Library",
      category: "Learning"
    },
    {
      src: "/placeholder.svg",
      title: "Sports Ground",
      category: "Activities"
    },
    {
      src: "/placeholder.svg",
      title: "Computer Lab",
      category: "Technology"
    },
    {
      src: "/placeholder.svg",
      title: "Annual Day Celebration",
      category: "Events"
    }
  ];

  return (
    <section id="gallery" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Our <span className="text-primary">Gallery</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Take a visual tour of our vibrant campus and activities
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <Card 
              key={index}
              className="overflow-hidden group cursor-pointer hover:shadow-custom-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <span className="text-xs font-semibold text-secondary">{image.category}</span>
                    <h3 className="text-lg font-bold">{image.title}</h3>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
