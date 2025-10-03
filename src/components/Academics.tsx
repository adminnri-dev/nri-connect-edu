import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, School, BookOpen, GraduationCap } from "lucide-react";
import classroomImage from "@/assets/classroom.jpg";

const Academics = () => {
  const programs = [
    {
      icon: Baby,
      title: "Pre-Primary",
      grades: "Nursery - UKG",
      description: "Foundation years focusing on play-based learning, basic motor skills, and social development.",
      color: "bg-accent"
    },
    {
      icon: School,
      title: "Primary",
      grades: "Class 1 - 4",
      description: "Building strong fundamentals in languages, mathematics, science, and environmental studies.",
      color: "bg-primary"
    },
    {
      icon: BookOpen,
      title: "Upper Primary",
      grades: "Class 5 - 7",
      description: "Comprehensive curriculum preparing students for advanced studies with practical learning.",
      color: "bg-secondary"
    },
    {
      icon: GraduationCap,
      title: "Secondary",
      grades: "Class 8 - 10",
      description: "SSC board preparation with focus on academic excellence and competitive exam readiness.",
      color: "bg-gradient-hero"
    }
  ];

  return (
    <section id="academics" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 bg-secondary">SSC Board</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Academic <span className="text-primary">Programs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive education from Nursery to 10th Standard following SSC curriculum
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {programs.map((program, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-custom-lg transition-all duration-300 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`${program.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                <program.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{program.title}</h3>
              <p className="text-sm font-medium text-primary mb-3">{program.grades}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{program.description}</p>
            </Card>
          ))}
        </div>

        {/* SSC Curriculum Highlight */}
        <Card className="overflow-hidden shadow-custom-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 flex flex-col justify-center">
              <Badge className="w-fit mb-4 bg-primary">SSC Board Excellence</Badge>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Maharashtra State Board Curriculum
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our SSC (Secondary School Certificate) curriculum is designed to provide students 
                with a strong foundation in core subjects while developing critical thinking and 
                problem-solving skills.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                  <p className="text-muted-foreground">Comprehensive subject coverage aligned with state board standards</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                  <p className="text-muted-foreground">Regular assessments and progress tracking</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                  <p className="text-muted-foreground">Focus on practical learning and application</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                  <p className="text-muted-foreground">Experienced faculty with proven track record</p>
                </li>
              </ul>
            </div>
            <div className="relative h-[400px] md:h-auto">
              <img 
                src={classroomImage} 
                alt="Classroom Learning" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Academics;
