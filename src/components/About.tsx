import { Card } from "@/components/ui/card";
import { Target, Heart, Lightbulb } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To provide quality education that develops students academically, socially, and emotionally, preparing them for future success."
    },
    {
      icon: Heart,
      title: "Our Values",
      description: "Integrity, excellence, respect, and compassion form the foundation of our educational philosophy and community."
    },
    {
      icon: Lightbulb,
      title: "Our Vision",
      description: "To be a leading educational institution recognized for academic excellence and holistic student development."
    }
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            About <span className="text-primary">NRI High School</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Excellence in Education Since Our Foundation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="animate-fade-in">
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Your Dreams Are Our Dreams
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              At NRI High School, we take pride in providing quality education aligned with the 
              SSC (Secondary School Certificate) board curriculum. From Nursery to 10th Standard, 
              we nurture young minds through a comprehensive educational approach.
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Our experienced faculty, modern infrastructure, and student-centered approach ensure 
              that every child receives personalized attention and opportunities to excel in academics, 
              sports, and extracurricular activities.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We believe in fostering an environment where excellence thrives, preparing students not 
              just for exams, but for life's challenges and opportunities.
            </p>
          </div>

          <div className="grid gap-6">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-custom-lg transition-shadow duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-hero p-3 rounded-lg flex-shrink-0">
                    <value.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground mb-2">{value.title}</h4>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
