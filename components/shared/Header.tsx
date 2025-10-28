import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const smoothTo = (id?: string) => (e: React.MouseEvent) => {
    if (!id) return;
    e.preventDefault();
    const el = document.querySelector(id) as HTMLElement | null;
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const sections = ['home', 'about', 'features', 'how-it-works', 'testimonials', 'contact'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        const visibleEntries = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio > 0.2);
        
        if (visibleEntries.length > 0) {
          // Sort by intersection ratio and take the most visible one
          const mostVisible = visibleEntries.reduce((prev, current) => 
            current.intersectionRatio > prev.intersectionRatio ? current : prev
          );
          setActiveSection(mostVisible.target.id);
        }
      },
      {
        threshold: [0.1, 0.2, 0.3, 0.5, 0.7],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    // Handle scroll to determine active section more precisely
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // If we're at the very top, always show home as active
      if (scrollY < 100) {
        setActiveSection('home');
        return;
      }
      
      // Find the section that's most in view
      let currentSection = 'home';
      
      sections.forEach((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollY;
          const elementHeight = rect.height;
          
          // Check if this section is currently most visible
          if (scrollY >= elementTop - windowHeight / 2 && 
              scrollY < elementTop + elementHeight - windowHeight / 2) {
            currentSection = sectionId;
          }
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Call once on mount

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isActive = (sectionId: string) => {
    return activeSection === sectionId;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                <path d="M12 5.67L9.88 7.79" className="animate-pulse"></path>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">OrganLink</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#home"
              onClick={smoothTo("#home")}
              className={`font-medium transition-all duration-300 relative ${
                isActive('home')
                  ? 'text-medical-600'
                  : 'text-gray-600 hover:text-medical-600'
              }`}
            >
              Home
              {isActive('home') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full" />
              )}
            </a>
            <a
              href="#about"
              onClick={smoothTo("#about")}
              className={`font-medium transition-all duration-300 relative ${
                isActive('about')
                  ? 'text-medical-600'
                  : 'text-gray-600 hover:text-medical-600'
              }`}
            >
              About
              {isActive('about') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full" />
              )}
            </a>
            <a
              href="#features"
              onClick={smoothTo("#features")}
              className={`font-medium transition-all duration-300 relative ${
                isActive('features')
                  ? 'text-medical-600'
                  : 'text-gray-600 hover:text-medical-600'
              }`}
            >
              Features
              {isActive('features') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full" />
              )}
            </a>
            <a
              href="#how-it-works"
              onClick={smoothTo("#how-it-works")}
              className={`font-medium transition-all duration-300 relative ${
                isActive('how-it-works')
                  ? 'text-medical-600'
                  : 'text-gray-600 hover:text-medical-600'
              }`}
            >
              How It Works
              {isActive('how-it-works') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full" />
              )}
            </a>
            <a
              href="#testimonials"
              onClick={smoothTo("#testimonials")}
              className={`font-medium transition-all duration-300 relative ${
                isActive('testimonials')
                  ? 'text-medical-600'
                  : 'text-gray-600 hover:text-medical-600'
              }`}
            >
              Testimonials
              {isActive('testimonials') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full" />
              )}
            </a>
            <a
              href="#contact"
              onClick={smoothTo("#contact")}
              className={`font-medium transition-all duration-300 relative ${
                isActive('contact')
                  ? 'text-medical-600'
                  : 'text-gray-600 hover:text-medical-600'
              }`}
            >
              Contact
              {isActive('contact') && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 rounded-full" />
              )}
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-3">
              <a
                href="#home"
                className={`font-medium py-2 px-2 rounded transition-all duration-300 ${
                  isActive('home')
                    ? 'text-medical-600 bg-medical-50 border-l-4 border-medical-600'
                    : 'text-gray-600 hover:text-medical-600 hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  smoothTo("#home")(e);
                  setIsMobileMenuOpen(false);
                }}
              >
                Home
              </a>
              <a
                href="#about"
                className={`font-medium py-2 px-2 rounded transition-all duration-300 ${
                  isActive('about')
                    ? 'text-medical-600 bg-medical-50 border-l-4 border-medical-600'
                    : 'text-gray-600 hover:text-medical-600 hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  smoothTo("#about")(e);
                  setIsMobileMenuOpen(false);
                }}
              >
                About
              </a>
              <a
                href="#features"
                className={`font-medium py-2 px-2 rounded transition-all duration-300 ${
                  isActive('features')
                    ? 'text-medical-600 bg-medical-50 border-l-4 border-medical-600'
                    : 'text-gray-600 hover:text-medical-600 hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  smoothTo("#features")(e);
                  setIsMobileMenuOpen(false);
                }}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className={`font-medium py-2 px-2 rounded transition-all duration-300 ${
                  isActive('how-it-works')
                    ? 'text-medical-600 bg-medical-50 border-l-4 border-medical-600'
                    : 'text-gray-600 hover:text-medical-600 hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  smoothTo("#how-it-works")(e);
                  setIsMobileMenuOpen(false);
                }}
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                className={`font-medium py-2 px-2 rounded transition-all duration-300 ${
                  isActive('testimonials')
                    ? 'text-medical-600 bg-medical-50 border-l-4 border-medical-600'
                    : 'text-gray-600 hover:text-medical-600 hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  smoothTo("#testimonials")(e);
                  setIsMobileMenuOpen(false);
                }}
              >
                Testimonials
              </a>
              <a
                href="#contact"
                className={`font-medium py-2 px-2 rounded transition-all duration-300 ${
                  isActive('contact')
                    ? 'text-medical-600 bg-medical-50 border-l-4 border-medical-600'
                    : 'text-gray-600 hover:text-medical-600 hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  smoothTo("#contact")(e);
                  setIsMobileMenuOpen(false);
                }}
              >
                Contact
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
