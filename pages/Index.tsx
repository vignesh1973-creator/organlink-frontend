import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion, useInView as useFramerInView, useAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { setPortalTitle } from "@/utils/pageTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Layout from "@/components/shared/Layout";
import { PublicPageSkeleton } from "@/components/ui/public-skeletons";
import {
  Shield,
  Zap,
  Users,
  ArrowRight,
  Activity,
  Award,
  Globe,
  Lock,
  Database,
  Brain,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

function useInView(ref: React.RefObject<Element>, rootMargin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { root: null, rootMargin, threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

// Framer Motion Animation Variants
const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 60 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInScale = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Motion wrapper component
function MotionSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useFramerInView(ref, { once: true, amount: 0.3 });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { 
            duration: 0.6, 
            delay: delay,
            ease: "easeOut" 
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUpNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const isFramerInView = useFramerInView(ref, { once: true, amount: 0.8 });

  useEffect(() => {
    if (!inView || !isFramerInView) return;
    let start: number | null = null;
    const duration = 2000; // Increased duration for smoother animation
    const startVal = 0;
    const endVal = value;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      const current = Math.floor(startVal + (endVal - startVal) * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [inView, isFramerInView, value]);

  const formatted = display.toLocaleString();
  return (
    <motion.div 
      ref={ref} 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isFramerInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
    >
      {formatted}
      {suffix}
    </motion.div>
  );
}

type Testimonial = {
  text: string;
  name: string;
  title: string;
  org: string;
  photo: string;
};

function chunk<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}

function TestimonialsCarousel() {
  const testimonials: Testimonial[] = [
    {
      text: "OrganLink helped us reduce matching time drastically while keeping records transparent.",
      name: "Dr. Emily Rodriguez",
      title: "Nephrology Director",
      org: "Apollo Hospital, Chennai",
      photo:
        "https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2Fcf4e58ef984543b58df3e13a88ca2ddb?format=webp&width=200",
    },
    {
      text: "The blockchain trail and IPFS storage give unparalleled confidence in the process.",
      name: "Dr. James Wilson",
      title: "Liver Transplant Specialist",
      org: "Global Health Org",
      photo:
        "https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2F2d318e7a6a764659878aa76289d2b0f4?format=webp&width=200",
    },
    {
      text: "Real-time notifications connected us with donors faster than ever.",
      name: "Dr. Maria Garcia",
      title: "Pediatric Transplant Surgeon",
      org: "City Care Hospital",
      photo:
        "https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2F4a84ccdd532a49b888b9ae232b4b35e8?format=webp&width=200",
    },
    {
      text: "Outstanding platform! The AI matching has revolutionized how we find compatible donors.",
      name: "Dr. Ahmed Khan",
      title: "Cardio-Thoracic Surgeon",
      org: "MedCity Hospital",
      photo:
        "https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2F8ce3b8f5ed784f5195df6ca3fa7b1741?format=webp&width=200",
    },
    {
      text: "For pediatric cases, every second counts. OrganLink's speed has saved countless young lives.",
      name: "Dr. Sarah Lee",
      title: "Pediatrician",
      org: "Children's Health Center",
      photo:
        "https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2F75632058974a40e7822c919dc3add4cb?format=webp&width=200",
    },
    {
      text: "Seamless onboarding and secure workflows. Our teams collaborate with confidence.",
      name: "Dr. Ravi Patel",
      title: "Transplant Coordinator",
      org: "CarePlus Hospitals",
      photo:
        "https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2Fd7c818018c9b40e2a1e5eaf655a1a32a?format=webp&width=200",
    },
    {
      text: "The platform's transparency and compliance features are unmatched. We trust OrganLink for every case.",
      name: "Dr. Michael Chen",
      title: "Chief of Cardiology",
      org: "Heart Center Medical",
      photo:
        "https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2F8ce3b8f5ed784f5195df6ca3fa7b1741?format=webp&width=200",
    },
    {
      text: "Real-time matching and secure data sharing gave us confidence in every transplant. OrganLink has significantly improved our success rates.",
      name: "Dr. Lisa Thompson",
      title: "Transplant Surgeon",
      org: "University Medical Center",
      photo:
        "https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2Fcf4e58ef984543b58df3e13a88ca2ddb?format=webp&width=200",
    },
    {
      text: "OrganLink's workflow streamlines our processes and improves patient outcomes. A game-changer for our hospital.",
      name: "Dr. Robert Kumar",
      title: "Head of Organ Transplantation",
      org: "Metropolitan Hospital",
      photo:
        "https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2Fd7c818018c9b40e2a1e5eaf655a1a32a?format=webp&width=200",
    },
  ];

  const slides = chunk(testimonials, 3);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  useEffect(() => {
    const next = () => setIndex((i) => (i + 1) % slides.length);
    timerRef.current = window.setInterval(next, 4000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const onMouseEnter = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
  };
  const onMouseLeave = () => {
    timerRef.current = window.setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      4000,
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerChildren}
        className="relative"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="overflow-hidden rounded-3xl">
          <div
            className="flex transition-transform duration-1000 ease-in-out"
            style={{
              transform: `translateX(-${index * 100}%)`,
            }}
          >
            {slides.map((group, gi) => (
              <div
                key={gi}
                className="w-full shrink-0 p-4"
                style={{ minWidth: '100%' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {group.map((testimonial, i) => (
                  <motion.div key={testimonial.name + i} variants={fadeInScale}>
                    <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden group">
                      <CardContent className="p-8 relative">
                        <div className="absolute top-4 right-4 text-blue-200 opacity-20 group-hover:opacity-30 transition-opacity">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                          </svg>
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex items-center space-x-1 mb-4">
                            {[...Array(5)].map((_, star) => (
                              <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                            "{testimonial.text}"
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={testimonial.photo}
                              alt={testimonial.name}
                              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">
                              {testimonial.name}
                            </div>
                            <div className="text-sm text-blue-600 font-medium">
                              {testimonial.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {testimonial.org}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation dots */}
        <div className="flex items-center justify-center mt-8 space-x-3">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                i === index 
                  ? "bg-gradient-to-r from-blue-500 to-green-500 shadow-lg" 
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [institute, setInstitute] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !email.trim() || !institute.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setSubmitting(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append('access_key', 'fb6147a3-d4a0-41d5-ada5-64b22431e33d');
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('subject', 'New Contact Form Submission from OrganLink Website');
      formData.append('message', `Contact Form Submission Details:\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nInstitute/Organization: ${institute.trim()}\n\nMessage:\n${message.trim()}\n\n---\nSubmitted via OrganLink website contact form`);
      formData.append('from_name', name.trim());
      formData.append('reply_to', email.trim());
      formData.append('to', 'muruganvignesh1973@gmail.com');
      // Add custom fields
      formData.append('institute', institute.trim());
      formData.append('original_message', message.trim());
      // Honeypot field for spam protection
      formData.append('botcheck', '');
      
      console.log('Sending form submission...');
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log('Web3Forms response:', result);
      
      if (result.success) {
        setSubmitted(true);
        setName("");
        setEmail("");
        setInstitute("");
        setMessage("");
        console.log('✅ Form submitted successfully! Email should be delivered to muruganvignesh1973@gmail.com');
        // Reset success message after 8 seconds
        setTimeout(() => setSubmitted(false), 8000);
      } else {
        console.error('❌ Web3Forms error:', result);
        throw new Error(result.message || `Form submission failed: ${JSON.stringify(result)}`);
      }
    } catch (err: any) {
      console.error('Form submission error:', err);
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (err.message.includes('CORS')) {
        errorMessage = 'Security restriction detected. Please try refreshing the page and submitting again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl shadow-sm border p-6 space-y-4"
    >
      {submitted && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md p-3">
          Thanks for reaching out. We will get back to you shortly.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
          {error}
        </div>
      )}
      
      {/* Honeypot field - hidden from users */}
      <input type="text" name="botcheck" className="hidden" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            autoComplete="email"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="institute">Institute or Organization *</Label>
        <Input
          id="institute"
          name="institute"
          type="text"
          value={institute}
          onChange={(e) => setInstitute(e.target.value)}
          required
          placeholder="Hospital or Organization name"
          autoComplete="organization"
        />
      </div>
      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Tell us about your needs and how we can help..."
          rows={5}
          minLength={10}
        />
      </div>
      <Button type="submit" disabled={submitting} className="w-full md:w-auto">
        {submitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Set public page title
    setPortalTitle("PUBLIC");
    
    // Simulate loading time for the public page
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading time
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <PublicPageSkeleton />;
  }
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20 pb-32" id="home">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-1/3 h-full">
          <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-100 to-green-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-20 right-32 w-96 h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-10 blur-3xl"></div>
        </div>
        
        <div className="container relative mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="text-gray-900">Revolutionizing</span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Organ Donation
                  </span>
                  <br />
                  <span className="text-gray-900">Through Technology</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                  Secure, transparent, and efficient platform connecting hospitals, 
                  organizations, and lives through blockchain-powered organ matching 
                  and allocation systems.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#contact"
                  className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  Learn More
                </motion.a>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-3xl blur-2xl opacity-20 transform rotate-6"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2Fd52b330c498649afbd923c9dbfd7267d?format=webp"
                    alt="OrganLink - Connecting Hearts, Securing Lives"
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">1,500+</div>
                      <div className="text-xs text-gray-600">Lives Saved</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Statistics Section */}
        <div className="relative -mt-4 z-10 pt-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={staggerChildren}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
                <motion.div variants={fadeInUp} className="space-y-2">
                  <CountUpNumber value={100000} suffix="+" />
                  <div className="text-gray-600 text-sm font-medium">
                    People waiting for organs
                  </div>
                </motion.div>
                <motion.div variants={fadeInUp} className="space-y-2">
                  <CountUpNumber value={17} suffix="+" />
                  <div className="text-gray-600 text-sm font-medium">
                    People die daily waiting
                  </div>
                </motion.div>
                <motion.div variants={fadeInUp} className="space-y-2">
                  <CountUpNumber value={95} suffix="%" />
                  <div className="text-gray-600 text-sm font-medium">
                    Success rate with AI matching
                  </div>
                </motion.div>
                <motion.div variants={fadeInUp} className="space-y-2">
                  <CountUpNumber value={1500} suffix="+" />
                  <div className="text-gray-600 text-sm font-medium">Hospitals Connected</div>
                </motion.div>
                <motion.div variants={fadeInUp} className="hidden md:block space-y-2">
                  <CountUpNumber value={3600} suffix="+" />
                  <div className="text-gray-600 text-sm font-medium">
                    Transplants Facilitated
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="pt-8 pb-32 bg-gradient-to-br from-gray-50 to-white" id="about">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <MotionSection className="space-y-8">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 rounded-full">
                  <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    About OrganLink
                  </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Cutting-Edge Technology for 
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    Life-Saving Solutions
                  </span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Our platform combines blockchain security, AI matching, and real-time 
                  coordination to revolutionize organ donation and transplantation.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Blockchain Security</h3>
                    <p className="text-gray-600">Immutable records and cryptographic security ensure data integrity and patient privacy.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Matching</h3>
                    <p className="text-gray-600">Advanced algorithms analyze compatibility factors to find optimal donor-recipient matches.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Coordination</h3>
                    <p className="text-gray-600">Instant notifications and updates ensure rapid response times for critical cases.</p>
                  </div>
                </div>
              </div>
            </MotionSection>
            
            <MotionSection delay={0.2} className="relative">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-3xl blur-2xl opacity-20 transform -rotate-6"></div>
                <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F405002c998c64b82876ceae617ac1008%2F4a84ccdd532a49b888b9ae232b4b35e8?format=webp&width=800"
                    alt="OrganLink about illustration"
                    className="w-full h-auto rounded-2xl"
                  />
                  <div className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-xs text-gray-600">Match Success</div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white" id="features">
        <div className="container mx-auto px-6">
          <MotionSection className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 rounded-full mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Our Features
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Cutting-Edge Technology for 
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Life-Saving Solutions
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our platform combines blockchain security, AI matching, and real-time coordination 
              to revolutionize organ donation and transplantation.
            </p>
          </MotionSection>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <motion.div whileHover={{ y: -5 }} className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      AI-Powered Matching
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Advanced algorithms analyze compatibility factors to find 
                      optimal donor-patient matches across our global network.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <motion.div whileHover={{ y: -5 }} className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Blockchain Security
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Immutable records on Ethereum Sepolia ensure complete 
                      transparency and tamper-proof documentation of all transactions.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <motion.div whileHover={{ y: -5 }} className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      OCR Verification
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Signature verification using Tesseract.js OCR technology 
                      ensures authentic consent and prevents fraud.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <motion.div whileHover={{ y: -5 }} className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-indigo-50/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Database className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      IPFS Storage
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Decentralized storage via Pinata API ensures documents are 
                      permanent, accessible, and distributed globally.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <motion.div whileHover={{ y: -5 }} className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-yellow-50/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Real-time Notifications
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Socket.IO powered instant alerts notify hospitals when matches 
                      are found, reducing critical response times.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <motion.div whileHover={{ y: -5 }} className="group">
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-teal-50/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Global Network
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Connect hospitals and organizations worldwide for cross-border 
                      organ matching and collaborative healthcare.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50" id="how-it-works">
        <div className="container mx-auto px-4">
          <MotionSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              How OrganLink Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A streamlined process designed for maximum security, efficiency,
              and life-saving impact.
            </p>
          </MotionSection>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="bg-medical-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Register
              </h3>
              <p className="text-gray-600">
                Hospitals register donors and patients with secure signature
                verification
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="bg-medical-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Verify
              </h3>
              <p className="text-gray-600">
                OCR technology validates signatures and uploads documents to
                IPFS
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="bg-medical-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Match
              </h3>
              <p className="text-gray-600">
                AI algorithms find optimal matches based on compatibility
                factors
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="bg-medical-600 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Connect
              </h3>
              <p className="text-gray-600">
                Real-time notifications connect hospitals for life-saving
                procedures
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white" id="testimonials">
        <div className="container mx-auto px-6">
          <MotionSection className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 rounded-full mb-6">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Testimonials
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              What Our 
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Partners Say
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Trusted by hospitals and organizations worldwide for secure, 
              efficient organ matching and allocation.
            </p>
          </MotionSection>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50" id="faqs">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about OrganLink.
            </p>
          </div>
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1" className="px-6">
                <AccordionTrigger className="py-5 text-left text-base">
                  How is patient data secured?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  We use blockchain for immutable records and IPFS for
                  decentralized document storage. Encryption and strict access
                  controls keep data private while enabling necessary medical
                  access.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="px-6">
                <AccordionTrigger className="py-5 text-left text-base">
                  What is the policy voting system?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  Organizations propose and vote on policies. Once approved,
                  policies are transparently recorded and enforced across the
                  network.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="px-6">
                <AccordionTrigger className="py-5 text-left text-base">
                  How does AI matching work?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  Our algorithms consider blood group, tissue type, urgency,
                  distance and more to recommend optimal donor–patient matches.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white" id="contact">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ready to revolutionize organ transplant matching at your
              institution?
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-medical-600 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">
                    support@organlink.org
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-medical-600 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium text-gray-900">
                    +1 (800) ORGAN
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-medical-600 mt-1" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium text-gray-900">
                    Healthcare Innovation Hub
                  </div>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Portal Access Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Access Your Portal
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Secure, role-based access for hospitals, organizations, and
              administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-medical-200">
              <CardContent className="p-8 text-center">
                <div className="bg-medical-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Activity className="h-8 w-8 text-medical-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Hospital Portal
                </h3>
                <p className="text-gray-600 mb-6">
                  Register donors and patients, manage AI matching, and receive
                  real-time notifications.
                </p>
                <Button className="w-full" asChild>
                  <Link to="/hospital/login">Access Hospital Portal</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-medical-200">
              <CardContent className="p-8 text-center">
                <div className="bg-medical-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Users className="h-8 w-8 text-medical-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Organization Portal
                </h3>
                <p className="text-gray-600 mb-6">
                  Propose policies, participate in voting, and manage
                  organizational guidelines.
                </p>
                <Button className="w-full" asChild>
                  <Link to="/organization/login">
                    Access Organization Portal
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-medical-200">
              <CardContent className="p-8 text-center">
                <div className="bg-medical-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <Award className="h-8 w-8 text-medical-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Admin Portal
                </h3>
                <p className="text-gray-600 mb-6">
                  Manage hospitals, organizations, monitor blockchain logs, and
                  system metrics.
                </p>
                <Button className="w-full" asChild>
                  <Link to="/admin/login">Access Admin Portal</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
