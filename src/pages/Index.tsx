
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Award, Briefcase, BookOpen } from "lucide-react";

const Index = () => {
  // Change the type here to accept null or HTMLElement
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

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

  // Update the addToRefs function to accept HTMLElement instead of HTMLDivElement
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
      icon: <Award className="h-12 w-12 text-primary" />
    },
    {
      title: "Comprehensive Training",
      description:
        "Deliver product knowledge, sales techniques, and relationship-building strategies through engaging modules.",
      icon: <BookOpen className="h-12 w-12 text-primary" />
    },
    {
      title: "Performance-Based Evaluation",
      description:
        "Assess real-world performance through practical sales tasks with outcome-based rewards.",
      icon: <Briefcase className="h-12 w-12 text-primary" />
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Application & Screening",
      description:
        "Collect basic information, video pitches, and assess baseline knowledge through MCQ tests.",
      isPrimary: true
    },
    {
      number: "02",
      title: "Training & Quizzes",
      description:
        "Provide comprehensive training modules followed by knowledge verification quizzes.",
      isPrimary: false
    },
    {
      number: "03",
      title: "Live Sales Task",
      description:
        "Evaluate real-world performance with outcome-based commission structure.",
      isPrimary: false
    },
    {
      number: "04",
      title: "Final Interview & Hiring",
      description:
        "Conduct final assessment and make hiring decisions based on overall performance.",
      isPrimary: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background"
          aria-hidden="true"
        />
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6 animate-slide-down">
              <span className="block">Transform Your Sales</span>
              <span className="block text-primary">Hiring Process</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto animate-slide-down" style={{ animationDelay: "0.1s" }}>
              A comprehensive platform for recruiting, training, and evaluating sales talent through a structured, 
              data-driven approach that identifies top performers.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-down" style={{ animationDelay: "0.2s" }}>
              <Button asChild size="lg" className="rounded-md px-8 py-6 text-lg">
                <Link to="/register">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-md px-8 py-6 text-lg">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-20 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
              <div className="relative aspect-video">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg hover-scale">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8 5.14v14l11-7-11-7z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="mt-6 text-xl font-semibold text-white">
                      See how it works
                    </h3>
                  </div>
                </div>
                {/* Placeholder for video thumbnail */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={(el) => addToRefs(el, 0)} 
        className="py-20 section-fade-in"
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
                className="glass-card rounded-xl p-8 transition-all duration-300 hover:shadow-xl"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section 
        ref={(el) => addToRefs(el, 1)} 
        className="py-20 bg-secondary/50 section-fade-in"
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`rounded-xl p-8 transition-all duration-300 hover:shadow-xl ${
                  step.isPrimary
                    ? "bg-primary text-primary-foreground"
                    : "bg-white"
                }`}
              >
                <div
                  className={`text-3xl font-bold mb-4 ${
                    step.isPrimary ? "text-primary-foreground/80" : "text-primary/60"
                  }`}
                >
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p
                  className={
                    step.isPrimary
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section 
        ref={(el) => addToRefs(el, 2)} 
        className="py-20 section-fade-in"
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
            <div className="glass-card rounded-xl p-8 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-6">For Hiring Managers</h3>
              <ul className="space-y-4">
                {[
                  "Streamlined candidate assessment process",
                  "Standardized evaluation criteria",
                  "Reduced time-to-hire",
                  "Data-driven hiring decisions",
                  "Enhanced quality of hire"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary shrink-0 mr-3" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-xl p-8 transition-all duration-300 hover:shadow-xl">
              <h3 className="text-xl font-semibold mb-6">For Candidates</h3>
              <ul className="space-y-4">
                {[
                  "Clear expectations at each stage",
                  "Valuable training and feedback",
                  "Practical sales experience",
                  "Opportunity to earn during assessment",
                  "Transparent evaluation process"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary shrink-0 mr-3" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={(el) => addToRefs(el, 3)} 
        className="py-20 bg-primary text-primary-foreground section-fade-in"
      >
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to Transform Your Sales Hiring?
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Start finding better sales talent with our comprehensive platform.
            </p>
            <Button asChild size="lg" variant="secondary" className="rounded-md px-8 py-6 text-lg">
              <Link to="/register">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
