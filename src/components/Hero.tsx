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
          <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
            <p className="text-gray-800 text-sm font-semibold">SSC Board Affiliated School</p>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Shaping Future
            <span className="block text-white drop-shadow-lg">Leaders Today</span>
          </h1>
          
          <p className="text-xl text-gray-800 mb-8 leading-relaxed font-medium">
            NRI High School offers quality education from Nursery to 10th Standard with SSC curriculum, 
            fostering academic excellence and holistic development.
          </p>

          <div className="mb-12">
            <Button 
              size="lg" 
              className="bg-gray-900 hover:bg-gray-800 text-white shadow-xl"
              onClick={() => setEnrollDialogOpen(true)}
            >
              Enroll Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Award className="w-8 h-8 text-gray-900" />
              </div>
              <p className="text-3xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-700 font-medium">Results</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Users className="w-8 h-8 text-gray-900" />
              </div>
              <p className="text-3xl font-bold text-gray-900">600+</p>
              <p className="text-sm text-gray-700 font-medium">Students</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <BookOpen className="w-8 h-8 text-gray-900" />
              </div>
              <p className="text-3xl font-bold text-gray-900">30+</p>
              <p className="text-sm text-gray-700 font-medium">Teachers</p>
            </div>
          </div>
        </div>
      </div>

      <EnrollmentDialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen} />
    </section>
  );
};

export default Hero;
