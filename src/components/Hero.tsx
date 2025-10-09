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
      {/* Solid Orange and Beige Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-orange-500 via-orange-400 to-amber-200">
        {/* Logo Watermark */}
        <div className="absolute inset-0 flex items-center justify-end pr-32 pointer-events-none">
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
          <div className="inline-block mb-4 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full border border-white/50 shadow-lg">
            <p className="text-orange-900 text-sm font-bold">SSC Board Affiliated School</p>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            Shaping Future
            <span className="block text-orange-900">Leaders Today</span>
          </h1>
          
          <p className="text-xl text-white mb-8 leading-relaxed font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
            NRI High School offers quality education from Nursery to 10th Standard with SSC curriculum, 
            fostering academic excellence and holistic development.
          </p>

          <div className="mb-12">
            <Button 
              size="lg" 
              className="bg-orange-900 hover:bg-orange-800 text-white shadow-2xl font-bold text-lg px-8 py-6"
              onClick={() => setEnrollDialogOpen(true)}
            >
              Enroll Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex justify-center mb-2">
                <Award className="w-8 h-8 text-orange-900" />
              </div>
              <p className="text-3xl font-bold text-white drop-shadow-md">100%</p>
              <p className="text-sm text-white font-semibold">Results</p>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex justify-center mb-2">
                <Users className="w-8 h-8 text-orange-900" />
              </div>
              <p className="text-3xl font-bold text-white drop-shadow-md">600+</p>
              <p className="text-sm text-white font-semibold">Students</p>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 shadow-lg">
              <div className="flex justify-center mb-2">
                <BookOpen className="w-8 h-8 text-orange-900" />
              </div>
              <p className="text-3xl font-bold text-white drop-shadow-md">40+</p>
              <p className="text-sm text-white font-semibold">Teachers</p>
            </div>
          </div>
        </div>
      </div>

      <EnrollmentDialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen} />
    </section>
  );
};

export default Hero;
