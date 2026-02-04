import { motion } from "framer-motion";
import { GraduationCap, Building2, School, Settings } from "lucide-react";

const Stakeholders = () => {
  const stakeholders = [
    {
      icon: GraduationCap,
      title: "Students",
      description: "Submit progress reports, receive feedback, track your learning journey, and build a portfolio of your professional experience.",
      features: [
        "Easy report submission",
        "Mobile-friendly access",
        "Deadline reminders",
        "Progress tracking",
      ],
      color: "from-primary to-primary/80",
    },
    {
      icon: Building2,
      title: "Industry Supervisors",
      description: "Mentor students effectively with structured feedback forms, attendance tracking, and direct communication channels.",
      features: [
        "Quick evaluation forms",
        "Attendance logging",
        "Student performance insights",
        "Direct messaging",
      ],
      color: "from-success to-success/80",
    },
    {
      icon: School,
      title: "University Supervisors",
      description: "Monitor all your students in real-time, coordinate visits, and ensure quality learning experiences.",
      features: [
        "Real-time monitoring",
        "Visit scheduling",
        "Intervention alerts",
        "Student support tools",
      ],
      color: "from-info to-info/80",
    },
    {
      icon: Settings,
      title: "Administrators",
      description: "Oversee the entire attachment program with comprehensive dashboards, reports, and analytics.",
      features: [
        "Program analytics",
        "Bulk management",
        "Custom reports",
        "System configuration",
      ],
      color: "from-accent to-warning",
    },
  ];

  return (
    <section id="universities" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            For All Stakeholders
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-4">
            Tailored Experience for Everyone
          </h2>
          <p className="text-muted-foreground text-lg">
            Each user gets a personalized interface designed for their specific 
            role in the industrial attachment ecosystem.
          </p>
        </motion.div>

        {/* Stakeholder cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {stakeholders.map((stakeholder, index) => (
            <motion.div
              key={stakeholder.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Gradient header */}
              <div className={`bg-gradient-to-r ${stakeholder.color} p-6`}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <stakeholder.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white">
                    {stakeholder.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {stakeholder.description}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {stakeholder.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stakeholders;
