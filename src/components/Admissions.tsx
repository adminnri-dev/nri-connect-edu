import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, FileText, Users, ClipboardCheck } from "lucide-react";

const Admissions = () => {
  const steps = [
    {
      icon: FileText,
      title: "Fill Application",
      description: "Complete the admission form with required details"
    },
    {
      icon: Users,
      title: "Interaction",
      description: "Meet with our admission counselor for guidance"
    },
    {
      icon: ClipboardCheck,
      title: "Document Submission",
      description: "Submit necessary documents and certificates"
    },
    {
      icon: CheckCircle,
      title: "Confirmation",
      description: "Receive admission confirmation and join the NRI family"
    }
  ];

  return (
    <section id="admissions" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Admissions <span className="text-primary">Open</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join NRI High School and be part of our journey towards excellence
          </p>
        </div>

        <Card className="bg-gradient-hero p-8 md:p-12 mb-12 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Admissions Open for Academic Year 2025-26
          </h3>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
            Limited seats available for Nursery to Class 10. Early bird discounts applicable.
          </p>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="p-6 text-center hover:shadow-custom-lg transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-accent" />
              </div>
              <div className="text-sm font-bold text-primary mb-2">Step {index + 1}</div>
              <h4 className="text-lg font-bold text-foreground mb-2">{step.title}</h4>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Admissions;
