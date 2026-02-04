import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  const features = [
    "Real-time progress tracking",
    "Automated reminders",
    "Industry supervisor feedback",
    "Analytics dashboard",
  ];

  return (
    <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-24 overflow-hidden bg-gradient-hero">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Trusted by 50+ Universities
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
              Transform Your{" "}
              <span className="text-gradient-primary">Industrial Attachment</span>{" "}
              Management
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              A comprehensive platform connecting students, supervisors, and administrators 
              for seamless internship tracking, feedback, and analytics.
            </p>

            {/* Feature checklist */}
            <div className="grid grid-cols-2 gap-3 mb-8 max-w-md mx-auto lg:mx-0">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 transition-opacity font-semibold text-base h-12 px-8 shadow-lg shadow-primary/25"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="font-semibold text-base h-12 px-8 border-2"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* Browser header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-background rounded-md text-xs text-muted-foreground">
                    app.trackmyattachment.co.ke
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Active Students", value: "1,247", color: "bg-primary/10 text-primary" },
                    { label: "Reports Submitted", value: "3,891", color: "bg-success/10 text-success" },
                    { label: "Avg. Completion", value: "94%", color: "bg-accent/10 text-accent" },
                  ].map((stat) => (
                    <div key={stat.label} className={`p-3 rounded-xl ${stat.color}`}>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs opacity-80">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress chart placeholder */}
                <div className="bg-muted/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Weekly Progress</span>
                    <span className="text-xs text-muted-foreground">Last 7 days</span>
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                        className="flex-1 bg-gradient-primary rounded-t-md"
                      />
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="space-y-2">
                  {[
                    { name: "Jane Wanjiku", action: "submitted weekly report", time: "2m ago" },
                    { name: "John Kamau", action: "received supervisor feedback", time: "15m ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {activity.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          <span className="font-medium">{activity.name}</span>{" "}
                          <span className="text-muted-foreground">{activity.action}</span>
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 bg-card rounded-xl shadow-xl border border-border p-4 hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Report Approved</p>
                  <p className="text-xs text-muted-foreground">Week 4 Progress</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -left-4 bg-card rounded-xl shadow-xl border border-border p-4 hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-lg">
                  ⭐
                </div>
                <div>
                  <p className="text-sm font-semibold">Excellent Rating</p>
                  <p className="text-xs text-muted-foreground">From Industry Supervisor</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
