 import { Link } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { ShieldX, Home } from "lucide-react";
 
 const Unauthorized = () => {
   return (
     <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
       <div className="text-center px-4">
         <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <ShieldX className="w-10 h-10 text-destructive" />
         </div>
         <h1 className="text-3xl font-display font-bold mb-2">Access Denied</h1>
         <p className="text-muted-foreground mb-8 max-w-md">
           You don't have permission to access this page. Please contact your administrator if you believe this is an error.
         </p>
         <Link to="/">
           <Button>
             <Home className="w-4 h-4 mr-2" />
             Go Home
           </Button>
         </Link>
       </div>
     </div>
   );
 };
 
 export default Unauthorized;