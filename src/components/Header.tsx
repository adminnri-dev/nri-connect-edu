import { useState } from "react";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/nri-logo.png";
import AdmissionInquiryDialog from "./AdmissionInquiryDialog";
import LoginDialog from "./auth/LoginDialog";
import SignupDialog from "./auth/SignupDialog";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Academics", href: "#academics" },
    { name: "Facilities", href: "#facilities" },
    { name: "Gallery", href: "#gallery" },
    { name: "Admissions", href: "#admissions" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3">
            <img src={logo} alt="NRI High School Logo" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-foreground">NRI High School</h1>
              <p className="text-xs text-muted-foreground">Making Future Leaders Today</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => setLoginDialogOpen(true)}
              className="gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
            <Button 
              variant="secondary"
              onClick={() => setSignupDialogOpen(true)}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </Button>
            <Button 
              className="bg-gradient-secondary hover:opacity-90"
              onClick={() => setInquiryDialogOpen(true)}
            >
              Apply Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden pb-4 animate-fade-in">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-3 text-foreground hover:text-primary transition-colors border-b border-border"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              <Button 
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setLoginDialogOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <LogIn className="w-4 h-4" />
                Login
              </Button>
              <Button 
                variant="secondary"
                className="w-full gap-2"
                onClick={() => {
                  setSignupDialogOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Button>
              <Button 
                className="w-full bg-gradient-secondary hover:opacity-90"
                onClick={() => {
                  setInquiryDialogOpen(true);
                  setIsMenuOpen(false);
                }}
              >
                Apply Now
              </Button>
            </div>
          </nav>
        )}
      </div>

      <AdmissionInquiryDialog 
        open={inquiryDialogOpen} 
        onOpenChange={setInquiryDialogOpen}
      />
      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
      />
      <SignupDialog 
        open={signupDialogOpen} 
        onOpenChange={setSignupDialogOpen}
      />
    </header>
  );
};

export default Header;
