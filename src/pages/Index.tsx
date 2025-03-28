import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  CheckCircle, 
  Award, 
  Briefcase, 
  BookOpen, 
  Play,
  User,
  BarChart3,
  Target,
  Zap,
  Users
} from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  const addToRefs = (el: HTMLElement | null, index: number) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current[index] = el;
    }
  };

  const features = [
    {
      title: "Structured Hiring Journey",
      description:
        "Guide candidates through a defined 4-step hiring process that evaluates skills at each stage.",
      icon: <Award className="h-12 w-12 text-primary" />,
      color: "bg-gradient-to-br from-violet-100 to-violet-50"
    },
    {
      title: "Comprehensive Training",
      description:
        "Deliver product knowledge, sales techniques, and relationship-building strategies through engaging modules.",
      icon: <BookOpen className="h-12 w-12 text-primary" />,
      color: "bg-gradient-to-br from-blue-100 to-blue-50"
    },
    {
      title: "Performance Evaluation",
      description:
        "Assess real-world performance through practical sales tasks with outcome-based rewards.",
      icon: <Briefcase className="h-12 w-12 text-primary" />,
      color: "bg-gradient-to-br from-emerald-100 to-emerald-50"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Application & Screening",
      description:
        "Collect basic information, video pitches, and assess baseline knowledge through MCQ tests.",
      isPrimary: true,
      image: "/step-1.jpg",
      icon: <User className="h-6 w-6" />
    },
    {
      number: "02",
      title: "Training & Quizzes",
      description:
        "Provide comprehensive training modules followed by knowledge verification quizzes.",
      isPrimary: false,
      image: "/step-2.jpg",
      icon: <BookOpen className="h-6 w-6" />
    },
    {
      number: "03",
      title: "Live Sales Task",
      description:
        "Evaluate real-world performance with outcome-based commission structure.",
      isPrimary: false,
      image: "/step-3.jpg",
      icon: <Target className="h-6 w-6" />
    },
    {
      number: "04",
      title: "Final Interview & Hiring",
      description:
        "Conduct final assessment and make hiring decisions based on overall performance.",
      isPrimary: false,
      image: "/step-4.jpg",
      icon: <Users className="h-6 w-6" />
    }
  ];

  const testimonials = [
    {
      quote: "The structured hiring process helped us identify top sales talent with 40% higher retention rates compared to our traditional methods.",
      name: "Rajesh Sharma",
      title: "Head of Sales, Tech Solutions Ltd",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: "HireSmart's approach to skills assessment through real sales tasks has transformed how we evaluate candidates and reduced our time-to-hire by 30%.",
      name: "Priya Patel",
      title: "HR Director, Global Retail Inc",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      quote: "The comprehensive training modules ensure our new hires are productive from day one. Our onboarding time dropped from weeks to just days.",
      name: "Amit Verma",
      title: "Sales Manager, IndiaGrowth Ltd",
      image: "https://randomuser.me/api/portraits/men/62.jpg"
    }
  ];

  const stats = [
    { value: "45%", label: "Higher retention rates", icon: <Users className="h-5 w-5 text-indigo-600" /> },
    { value: "3.2x", label: "ROI on hiring investment", icon: <BarChart3 className="h-5 w-5 text-indigo-600" /> },
    { value: "62%", label: "Faster time-to-productivity", icon: <Zap className="h-5 w-5 text-indigo-600" /> }
  ];

  const renderAuthButtons = () => {
    if (user) {
      let dashboardPath = '/dashboard/candidate';
      if (profile?.role === 'admin') {
        dashboardPath = '/dashboard/admin';
      } else if (profile?.role === 'manager') {
        dashboardPath = '/dashboard/manager';
      }
      
      return (
        <Button 
          size="lg" 
          className="rounded-md px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          onClick={handleNavigation(dashboardPath)}
        >
          Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      );
    }
    
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <Button 
          size="lg" 
          className="rounded-md px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          onClick={handleNavigation('/register')}
        >
          Apply Now <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="rounded-md px-8 py-6 text-lg border-indigo-200 hover:border-indigo-300 shadow-sm hover:shadow transition-all"
          onClick={handleNavigation('/login')}
        >
          Sign In
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-blue-50 via-indigo-50 to-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-50"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-100 filter blur-3xl opacity-50"></div>
          <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-blue-100 filter blur-3xl opacity-40"></div>
        </div>
        
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6 animate-fade-in">
              <span className="block">Transform Your Sales</span>
              <span className="block text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Recruitment Process</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
              A comprehensive platform for recruiting, training, and evaluating sales talent through a structured, 
              data-driven approach that identifies top performers.
            </p>
            <div className="mt-10">
              {renderAuthButtons()}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-20 bg-white rounded-xl shadow-xl animate-slide-up overflow-hidden" style={{ animationDelay: "0.3s" }}>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {stats.map((stat, i) => (
              <div key={i} className={`p-8 flex items-center ${i !== stats.length - 1 ? 'md:border-r border-gray-100' : ''} ${i !== 0 ? 'border-t md:border-t-0' : ''}`}>
                <div className="p-3 rounded-full bg-indigo-50 mr-4">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative aspect-video">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 flex items-center justify-center z-10">
                  <div className="text-center p-6">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg hover:scale-110 transition-transform cursor-pointer">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-white drop-shadow-md">
                      Watch how it works
                    </h3>
                  </div>
                </div>
                <div className="absolute inset-0">
                  <img 
                    src="/sales-team.jpg" 
                    alt="Sales team in action" 
                    className="w-full h-full object-cover brightness-75"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section 
        ref={(el) => addToRefs(el, 0)} 
        className="py-24 section-fade-in bg-white"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Comprehensive Sales Hiring Platform
            </h2>
            <p className="text-xl text-muted-foreground">
              Our platform offers everything you need to identify, train, and retain top sales talent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`rounded-xl p-8 transition-all duration-300 hover:shadow-xl ${feature.color} hover:-translate-y-1`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section 
        ref={(el) => addToRefs(el, 1)} 
        className="py-24 bg-gradient-to-br from-indigo-50 to-white section-fade-in"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              A Data-Driven Hiring Process
            </h2>
            <p className="text-xl text-muted-foreground">
              Our four-step approach evaluates candidates on both knowledge and practical skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`rounded-xl transition-all duration-300 hover:shadow-xl overflow-hidden ${
                  step.isPrimary
                    ? "border-2 border-indigo-500"
                    : "border border-gray-200"
                }`}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                  <div className="absolute bottom-4 left-4 z-20 flex items-center space-x-2">
                    <div className={`rounded-full p-2 ${step.isPrimary ? "bg-indigo-600" : "bg-white"}`}>
                      <div className={step.isPrimary ? "text-white" : "text-indigo-600"}>
                        {step.icon}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${step.isPrimary ? "text-white" : "text-white"}`}>
                      {step.number}
                    </div>
                  </div>
                  <img 
                    src={step.image}
                    alt={`Step ${index + 1}`} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section 
        ref={(el) => addToRefs(el, 2)} 
        className="py-24 bg-white section-fade-in"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Hear from businesses that have transformed their sales hiring process
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/1">
                    <div className="p-4">
                      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl p-8 shadow-lg">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-md">
                            <img 
                              src={testimonial.image} 
                              alt={testimonial.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="mb-4">
                              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.33333 14.6667C9.33333 13.2 10.2 12 11.6 12H12.8C13.4667 12 14 11.4667 14 10.8V9.2C14 8.53333 13.4667 8 12.8 8H11.6C7.93333 8 5 10.9333 5 14.6667V22.8C5 24.1333 6.06667 25.2 7.4 25.2H11.6C12.9333 25.2 14 24.1333 14 22.8V18.6C14 17.2667 12.9333 16.2 11.6 16.2H9.33333V14.6667ZM22.6667 14.6667C22.6667 13.2 23.5333 12 24.9333 12H26.1333C26.8 12 27.3333 11.4667 27.3333 10.8V9.2C27.3333 8.53333 26.8 8 26.1333 8H24.9333C21.2667 8 18.3333 10.9333 18.3333 14.6667V22.8C18.3333 24.1333 19.4 25.2 20.7333 25.2H24.9333C26.2667 25.2 27.3333 24.1333 27.3333 22.8V18.6C27.3333 17.2667 26.2667 16.2 24.9333 16.2H22.6667V14.6667Z" fill="#8B5CF6"/>
                              </svg>
                            </div>
                            <blockquote className="text-lg italic text-gray-700 mb-6">
                              {testimonial.quote}
                            </blockquote>
                            <div>
                              <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                              <p className="text-indigo-600">{testimonial.title}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-8">
                <CarouselPrevious className="relative static transform-none translate-y-0 mr-2" />
                <CarouselNext className="relative static transform-none translate-y-0 ml-2" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      <section 
        ref={(el) => addToRefs(el, 3)} 
        className="py-24 bg-gradient-to-br from-indigo-50 to-white section-fade-in"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Benefits for Your Business
            </h2>
            <p className="text-xl text-muted-foreground">
              Our platform offers tangible improvements to your sales hiring outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl p-8 transition-all duration-300 hover:shadow-xl bg-white border border-indigo-100">
              <h3 className="text-xl font-semibold mb-6 text-indigo-600">For Hiring Managers</h3>
              <ul className="space-y-4">
                {[
                  "Streamlined candidate assessment process",
                  "Standardized evaluation criteria",
                  "Reduced time-to-hire",
                  "Data-driven hiring decisions",
                  "Enhanced quality of hire"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="p-1 bg-indigo-100 rounded-full mr-3 flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl p-8 transition-all duration-300 hover:shadow-xl bg-white border border-indigo-100">
              <h3 className="text-xl font-semibold mb-6 text-indigo-600">For Candidates</h3>
              <ul className="space-y-4">
                {[
                  "Clear expectations at each stage",
                  "Valuable training and feedback",
                  "Practical sales experience",
                  "Opportunity to earn during assessment",
                  "Transparent evaluation process"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="p-1 bg-indigo-100 rounded-full mr-3 flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section 
        ref={(el) => addToRefs(el, 4)} 
        className="py-20 section-fade-in bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to Transform Your Sales Hiring?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Start finding better sales talent with our comprehensive platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="rounded-md px-8 py-6 text-lg bg-white text-indigo-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all">
                <Link to="/register">Apply Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-md px-8 py-6 text-lg border-white text-white hover:bg-white/10">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
        .text-gradient {
          background-size: 300% 300%;
          animation: gradient 8s ease infinite;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .section-fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .section-fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        `}
      </style>
    </div>
  );
};

export default Index;
