import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Users, BookOpen } from "lucide-react";
import heroImage from "@/assets/hero-school.jpg";
import logo from "@/assets/nri-logo.png";
import EnrollmentDialog from "./EnrollmentDialog";

const Hero = () => {
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="NRI High School Campus" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 to-primary/70"></div>
        
        {/* Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img 
            src={logo} 
            alt="" 
            className="w-[600px] h-[600px] object-contain opacity-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl animate-fade-in">
          <div className="inline-block mb-4 px-4 py-2 bg-secondary/20 backdrop-blur-sm rounded-full border border-secondary/30">
            <p className="text-primary-foreground text-sm font-medium">SSC Board Affiliated School</p>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Shaping Future
            <span className="block text-secondary">Leaders Today</span>
          </h1>
          
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            NRI High School offers quality education from Nursery to 10th Standard with SSC curriculum, 
            fostering academic excellence and holistic development.
          </p>

          <div className="mb-12">
            <Button 
              size="lg" 
              className="bg-secondary hover:opacity-90 text-secondary-foreground"
              onClick={() => setEnrollDialogOpen(true)}
            >
              Enroll Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <p className="text-3xl font-bold text-primary-foreground">100%</p>
              <p className="text-sm text-primary-foreground/80">Results</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <p className="text-3xl font-bold text-primary-foreground">500+</p>
              <p className="text-sm text-primary-foreground/80">Students</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <BookOpen className="w-8 h-8 text-accent" />
              </div>
              <p className="text-3xl font-bold text-primary-foreground">50+</p>
              <p className="text-sm text-primary-foreground/80">Teachers</p>
            </div>
          </div>
        </div>
      </div>

      <EnrollmentDialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen} />
    </section>
  );
};

export default Hero;
