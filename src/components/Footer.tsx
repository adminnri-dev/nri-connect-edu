import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";
import logo from "@/assets/nri-logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="NRI High School Logo" className="w-12 h-12 object-contain" />
              <span className="font-bold text-lg">NRI High School</span>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              Committed to providing quality education from Nursery to 10th Standard with SSC curriculum.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="text-background/80 hover:text-background transition-colors">About Us</a></li>
              <li><a href="#academics" className="text-background/80 hover:text-background transition-colors">Academics</a></li>
              <li><a href="#facilities" className="text-background/80 hover:text-background transition-colors">Facilities</a></li>
              <li><a href="#admissions" className="text-background/80 hover:text-background transition-colors">Admissions</a></li>
            </ul>
          </div>

          {/* Academics */}
          <div>
            <h4 className="font-bold mb-4">Academics</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-background/80">Pre-Primary (Nursery - UKG)</li>
              <li className="text-background/80">Primary (Class 1-4)</li>
              <li className="text-background/80">Upper Primary (Class 5-7)</li>
              <li className="text-background/80">Secondary (Class 8-10)</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li>C-48, Gurudwara Rd</li>
              <li>Opp HDFC ATM, Dwarakamai Nagar Colony</li>
              <li>Vanasthalipuram, Hyderabad</li>
              <li>Telangana 500070</li>
              <li>Phone: +91 9618139109</li>
              <li>Email: info@nrihighschool.edu</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/80 text-sm">
            © {currentYear} NRI High School. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 transition-colors flex items-center justify-center">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 transition-colors flex items-center justify-center">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 transition-colors flex items-center justify-center">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 transition-colors flex items-center justify-center">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
