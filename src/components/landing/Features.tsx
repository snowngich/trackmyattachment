import { 
  ClipboardCheck, 
  BarChart3, 
  Bell, 
  Users, 
  FileText, 
  Shield,
  Smartphone,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

const Features = () => {
  const features = [
    {
      icon: ClipboardCheck,
      title: "Progress Tracking",
      description: "Students submit weekly reports with activities, learnings, and challenges. Track completion rates in real-time.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: MessageSquare,
      title: "Supervisor Feedback",
      description: "Industry supervisors provide structured evaluations and mentorship feedback through intuitive forms.",
      color: "bg-success/10 text-success",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into attachment outcomes, student performance, and program effectiveness.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Automated reminders for report deadlines, pending reviews, and important milestones.",
      color: "bg-info/10 text-info",
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Tailored interfaces for students, university supervisors, industry mentors, and administrators.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Centralized storage for acceptance letters, logbooks, evaluation forms, and certificates.",
      color: "bg-warning/10 text-warning",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Full functionality on any device. Students can submit reports on-the-go from their phones.",
      color: "bg-success/10 text-success",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security with role-based access control and data encryption.",
      color: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <section id="features" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Platform Features
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-4">
            Everything You Need to Manage Attachments
          </h2>
          <p className="text-muted-foreground text-lg">
            A unified digital ecosystem that streamlines communication, improves monitoring, 
            and provides data-driven insights for all stakeholders.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
