import { motion } from "framer-motion";

const Stats = () => {
  const stats = [
    { value: "50+", label: "Universities", description: "Institutions using our platform" },
    { value: "15,000+", label: "Students", description: "Successfully tracked attachments" },
    { value: "3,500+", label: "Supervisors", description: "Industry & academic mentors" },
    { value: "98%", label: "Completion Rate", description: "Attachment success rate" },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-primary relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl lg:text-5xl font-extrabold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-white/90 font-semibold text-lg mb-1">
                {stat.label}
              </div>
              <div className="text-white/60 text-sm">
                {stat.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
