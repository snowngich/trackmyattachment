 import { GraduationCap } from "lucide-react";
 import { motion } from "framer-motion";
 
 interface AuthLayoutProps {
   children: React.ReactNode;
   title: string;
   description: string;
 }
 
 const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
   return (
     <div className="min-h-screen bg-gradient-hero flex">
       {/* Left side - Branding */}
       <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary p-12 flex-col justify-between">
         <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
             <GraduationCap className="w-7 h-7 text-white" />
           </div>
           <span className="font-display font-bold text-2xl text-white">
             TrackMyAttachment
           </span>
         </div>
 
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="space-y-6"
         >
           <h1 className="text-4xl lg:text-5xl font-display font-bold text-white leading-tight">
             Streamline Your Industrial Attachment Journey
           </h1>
           <p className="text-white/80 text-lg max-w-md">
             Connect students, supervisors, and coordinators on a single platform 
             designed to make attachment management effortless.
           </p>
         </motion.div>
 
         <div className="flex gap-8 text-white/60 text-sm">
           <span>© 2024 TrackMyAttachment</span>
           <a href="#" className="hover:text-white transition-colors">Privacy</a>
           <a href="#" className="hover:text-white transition-colors">Terms</a>
         </div>
       </div>
 
       {/* Right side - Form */}
       <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
         <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full max-w-md"
         >
           <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
             <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
               <GraduationCap className="w-5 h-5 text-white" />
             </div>
             <span className="font-display font-bold text-xl">
               Track<span className="text-primary">My</span>Attachment
             </span>
           </div>
 
           <div className="text-center mb-8">
             <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
             <p className="text-muted-foreground mt-2">{description}</p>
           </div>
 
           {children}
         </motion.div>
       </div>
     </div>
   );
 };
 
 export default AuthLayout;