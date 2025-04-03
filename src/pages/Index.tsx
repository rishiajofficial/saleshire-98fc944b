
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Zap,
  Rocket,
  Lightbulb,
  BrainCircuit,
  Target,
  BarChart3,
  DatabaseZap,
  MessageSquareMore,
  SquareCode,
  Users,
  CheckCircle
} from "lucide-react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "@/components/ui/motion";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeDemo, setActiveDemo] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  // Animation on scroll
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

  // Progress bar animation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 1;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  const addToRefs = (el: HTMLElement | null, index: number) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current[index] = el;
    }
  };

  const aiFeatures = [
    {
      title: "AI-Powered Candidate Matching",
      description: "Our algorithms analyze candidate profiles against job requirements, identifying the best matches based on skills, experience, and cultural fit.",
      icon: <BrainCircuit className="h-12 w-12 text-purple-500" />,
      color: "bg-gradient-to-br from-purple-100 to-purple-50"
    },
    {
      title: "Smart Skill Assessment",
      description: "Automatically evaluate candidates' skills through tailored assessments that adapt to their responses in real-time.",
      icon: <SquareCode className="h-12 w-12 text-indigo-500" />,
      color: "bg-gradient-to-br from-indigo-100 to-indigo-50"
    },
    {
      title: "Interview Intelligence",
      description: "Generate personalized interview questions and analyze responses to provide data-driven hiring recommendations.",
      icon: <MessageSquareMore className="h-12 w-12 text-blue-500" />,
      color: "bg-gradient-to-br from-blue-100 to-blue-50"
    },
    {
      title: "Predictive Performance Analytics",
      description: "Forecast candidate success potential based on historical data and performance patterns from your top performers.",
      icon: <DatabaseZap className="h-12 w-12 text-emerald-500" />,
      color: "bg-gradient-to-br from-emerald-100 to-emerald-50"
    }
  ];

  const features = [
    {
      title: "Structured Hiring Journey",
      description: "Guide candidates through a defined 4-step hiring process that evaluates skills at each stage.",
      icon: <Rocket className="h-12 w-12 text-primary" />,
      color: "bg-gradient-to-br from-violet-100 to-violet-50"
    },
    {
      title: "Comprehensive Training",
      description: "Deliver product knowledge, sales techniques, and relationship-building strategies through engaging modules.",
      icon: <Lightbulb className="h-12 w-12 text-primary" />,
      color: "bg-gradient-to-br from-blue-100 to-blue-50"
    },
    {
      title: "Performance Evaluation",
      description: "Assess real-world performance through practical sales tasks with outcome-based rewards.",
      icon: <Target className="h-12 w-12 text-primary" />,
      color: "bg-gradient-to-br from-emerald-100 to-emerald-50"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Application & Screening",
      description: "Collect basic information, video pitches, and assess baseline knowledge through AI-powered analysis.",
      isPrimary: true,
      image: "/images/step-1.webp",
      icon: <Users className="h-6 w-6" />
    },
    {
      number: "02",
      title: "Training & Quizzes",
      description: "Provide intelligent training modules that adapt to individual learning patterns.",
      isPrimary: false,
      image: "/images/step-2.webp",
      icon: <Lightbulb className="h-6 w-6" />
    },
    {
      number: "03",
      title: "Live Sales Task",
      description: "Evaluate real-world performance with AI-assisted feedback and coaching.",
      isPrimary: false,
      image: "/images/step-3.webp",
      icon: <Target className="h-6 w-6" />
    },
    {
      number: "04",
      title: "Final Interview & Hiring",
      description: "Data-driven decisions based on comprehensive performance analytics.",
      isPrimary: false,
      image: "/images/step-4.webp",
      icon: <Users className="h-6 w-6" />
    }
  ];

  const stats = [
    { value: "45%", label: "Higher retention rates", icon: <Users className="h-5 w-5 text-indigo-600" /> },
    { value: "3.2x", label: "ROI on hiring investment", icon: <BarChart3 className="h-5 w-5 text-indigo-600" /> },
    { value: "62%", label: "Faster time-to-productivity", icon: <Zap className="h-5 w-5 text-indigo-600" /> }
  ];

  const demoScreens = [
    {
      title: "AI-Powered Candidate Dashboard",
      description: "Real-time performance tracking with AI-generated recommendations and personalized growth paths.",
      image: "/images/demo-dashboard.webp"
    },
    {
      title: "Smart Assessment Engine",
      description: "Adaptive questioning that adjusts difficulty based on candidate responses and provides instant feedback.",
      image: "/images/demo-assessment.webp"
    },
    {
      title: "Performance Analytics",
      description: "Comprehensive metrics and predictive insights help identify top performers early in the process.",
      image: "/images/demo-analytics.webp"
    }
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
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-indigo-50 via-purple-50 to-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-30"></div>
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-200 filter blur-3xl opacity-60"></div>
          <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-indigo-200 filter blur-3xl opacity-50"></div>
        </div>
        
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6 animate-fade-in">
              <span className="block">Revolutionize Your</span>
              <span className="block text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Sales Talent Acquisition</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
              An AI-powered platform that transforms how you recruit, train, and evaluate sales talent 
              with data-driven insights and adaptive learning.
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
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/40 to-purple-500/40 flex items-center justify-center z-10">
                  <div className="text-center p-6">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg hover:scale-110 transition-transform cursor-pointer">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-white drop-shadow-md">
                      See the AI in action
                    </h3>
                  </div>
                </div>
                <div className="absolute inset-0">
                  <img 
                    src="/images/sales-team.webp" 
                    alt="Sales team in action" 
                    className="w-full h-full object-cover brightness-75"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-4.0.3";
                      target.onerror = null;
                    }}
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
            <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full mb-4">
              The Future of Sales Hiring
            </span>
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
                className={`rounded-xl p-8 transition-all duration-300 hover:shadow-xl ${feature.color} hover:-translate-y-1 cursor-pointer`}
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
        className="py-24 section-fade-in bg-gradient-to-br from-indigo-50 to-white"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-medium text-purple-800 bg-purple-100 rounded-full mb-4">
              AI-Powered Features
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Smart Technology, Smarter Hiring
            </h2>
            <p className="text-xl text-muted-foreground">
              Our artificial intelligence enhances every aspect of the recruitment process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiFeatures.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl overflow-hidden"
              >
                <div className={`p-6 ${feature.color}`}>
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div
                    className="cursor-pointer text-indigo-600 hover:text-indigo-800 transition-all text-sm font-medium flex items-center"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    Learn more <ArrowRight className={`ml-1 h-4 w-4 transition-transform ${isHovering ? 'translate-x-1' : ''}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section 
        ref={(el) => addToRefs(el, 2)} 
        className="py-24 section-fade-in bg-white"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full mb-4">
              Interactive Platform
            </span>
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
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://images.unsplash.com/photo-156010291${index + 1}555-e07d5${index + 1}c4d4a?auto=format&fit=crop&w=800&q=60`;
                      target.onerror = null;
                    }}
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
        ref={(el) => addToRefs(el, 3)}
        className="py-24 section-fade-in bg-gradient-to-br from-purple-50 to-white"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-medium text-purple-800 bg-purple-100 rounded-full mb-4">
              Interactive Demo
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              See Our Platform in Action
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience how our AI-powered tools transform the hiring process
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {demoScreens.map((demo, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all ${
                    activeDemo === index
                      ? "bg-white shadow-lg border-2 border-indigo-500"
                      : "bg-white/50 hover:bg-white border border-gray-200"
                  }`}
                  onClick={() => setActiveDemo(index)}
                >
                  <h3 className={`text-lg font-semibold mb-2 ${
                    activeDemo === index ? "text-indigo-600" : "text-gray-800"
                  }`}>
                    {demo.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {demo.description}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-3 bg-white p-4 rounded-xl shadow-xl border border-gray-200">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-r from-indigo-600 to-purple-500 rounded-t-lg flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-4 text-xs text-white font-medium">
                    {demoScreens[activeDemo].title}
                  </div>
                </div>
                <div className="mt-8 p-4">
                  <img
                    src={demoScreens[activeDemo].image}
                    alt={demoScreens[activeDemo].title}
                    className="w-full h-full object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://images.unsplash.com/photo-15560${activeDemo + 1}0120998-a94e0eb934c0?auto=format&fit=crop&w=800&q=60`;
                      target.onerror = null;
                    }}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-white text-xs">
                      <span>Processing data</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section 
        ref={(el) => addToRefs(el, 4)} 
        className="py-24 section-fade-in bg-white"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full mb-4">
              Business Impact
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
              Benefits for Your Business
            </h2>
            <p className="text-xl text-muted-foreground">
              Our platform offers tangible improvements to your sales hiring outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-xl p-8 transition-all duration-300 hover:shadow-xl bg-white border border-indigo-100">
              <h3 className="text-xl font-semibold mb-6 text-indigo-600 flex items-center">
                <Rocket className="h-5 w-5 mr-2" /> For Hiring Managers
              </h3>
              <ul className="space-y-4">
                {[
                  "AI-powered candidate matching reduces screening time by 60%",
                  "Data-driven insights eliminate hiring biases",
                  "Predictive analytics forecast candidate success with 85% accuracy",
                  "Standardized evaluation criteria ensure consistent assessment",
                  "Intelligent interviewing tools generate personalized questions"
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
              <h3 className="text-xl font-semibold mb-6 text-indigo-600 flex items-center">
                <Users className="h-5 w-5 mr-2" /> For Candidates
              </h3>
              <ul className="space-y-4">
                {[
                  "Personalized learning paths adapt to individual strengths",
                  "AI-generated feedback provides actionable improvement steps",
                  "Interactive assessments that engage rather than evaluate",
                  "Real-time progress tracking with performance insights",
                  "Skills-based evaluation ensures fair opportunity"
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
        ref={(el) => addToRefs(el, 5)} 
        className="py-20 section-fade-in bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to Transform Your Sales Hiring?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join the next generation of smart recruitment platforms.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" variant="secondary" className="rounded-md px-8 py-6 text-lg bg-white text-indigo-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all">
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-md px-8 py-6 text-lg border-white text-white hover:bg-white/10">
                <Link to="/login">Schedule a Demo</Link>
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
