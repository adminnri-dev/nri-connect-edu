import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      detail: "+91 9618139109",
      link: "tel:+919618139109"
    },
    {
      icon: Mail,
      title: "Email",
      detail: "info@nrihighschool.edu",
      link: "mailto:info@nrihighschool.edu"
    },
    {
      icon: MapPin,
      title: "Address",
      detail: "C-48, Gurudwara Rd, Opp HDFC ATM, Dwarakamai Nagar Colony, Vanasthalipuram, Hyderabad, Telangana 500070",
      link: "#"
    },
    {
      icon: Clock,
      title: "Office Hours",
      detail: "Mon - Sat: 8:00 AM - 4:00 PM",
      link: "#"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card 
                key={index}
                className="p-6 hover:shadow-custom-lg transition-shadow animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <a href={info.link} className="flex items-start gap-4">
                  <div className="bg-gradient-secondary p-3 rounded-lg flex-shrink-0">
                    <info.icon className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1">{info.title}</h4>
                    <p className="text-muted-foreground">{info.detail}</p>
                  </div>
                </a>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="p-8">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    First Name
                  </label>
                  <Input placeholder="John" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Last Name
                  </label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Email
                </label>
                <Input type="email" placeholder="john.doe@example.com" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Phone
                </label>
                <Input type="tel" placeholder="+91 99999 99999" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Message
                </label>
                <Textarea 
                  placeholder="Tell us about your inquiry..." 
                  className="min-h-[120px]"
                />
              </div>
              
              <Button className="w-full bg-gradient-hero hover:opacity-90">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;
