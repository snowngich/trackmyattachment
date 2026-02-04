import { motion } from "framer-motion";
import { UserPlus, ClipboardList, MessageSquareText, Award } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      step: "01",
      title: "Register & Setup",
      description: "Students register their attachment details including host organization, supervisor contacts, and attachment period.",
    },
    {
      icon: ClipboardList,
      step: "02",
      title: "Submit Reports",
      description: "Weekly progress reports with activities, skills learned, challenges faced, and hours logged.",
    },
    {
      icon: MessageSquareText,
      step: "03",
      title: "Receive Feedback",
      description: "Industry and university supervisors provide structured feedback, ratings, and mentorship guidance.",
    },
    {
      icon: Award,
      step: "04",
      title: "Complete & Certify",
      description: "Final evaluation, completion certificate generation, and comprehensive attachment report.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-4">
            Simple, Streamlined Process
          </h2>
          <p className="text-muted-foreground text-lg">
            From registration to certification, every step of the industrial 
            attachment journey is digitized and simplified.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step number with icon */}
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center shadow-md">
                    {step.step}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-xl text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
