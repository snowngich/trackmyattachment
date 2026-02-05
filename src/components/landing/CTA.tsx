import { Button } from "@/components/ui/button";
 import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section id="contact" className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-card rounded-3xl border border-border overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
          </div>

          <div className="relative px-6 py-12 lg:px-16 lg:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                Get Started Today
              </span>
              <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mt-3 mb-4">
                Ready to Transform Your Attachment Program?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                Join universities across Kenya and beyond who are already using 
                TrackMyAttachment to streamline their industrial attachment management.
              </p>

               {/* CTA Buttons */}
               <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                 <Link to="/signup">
                   <Button 
                     size="lg" 
                     className="bg-gradient-primary hover:opacity-90 transition-opacity font-semibold h-12 px-8 shadow-lg shadow-primary/25"
                   >
                     Get Started Free
                     <ArrowRight className="w-4 h-4 ml-2" />
                   </Button>
                 </Link>
                 <Link to="/login">
                   <Button 
                     size="lg" 
                     variant="outline"
                     className="h-12 px-8 font-semibold"
                   >
                     Sign In
                   </Button>
                 </Link>
               </div>

              <p className="text-sm text-muted-foreground">
                Free 30-day trial • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
