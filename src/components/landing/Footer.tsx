import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const links = {
    Product: ["Features", "Pricing", "Demo", "Changelog"],
    Resources: ["Documentation", "Help Center", "Blog", "Case Studies"],
    Company: ["About Us", "Careers", "Contact", "Press"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-background">
                Track<span className="text-primary">My</span>Attachment
              </span>
            </a>
            <p className="text-background/70 mb-6 max-w-sm leading-relaxed">
              A comprehensive platform for managing student industrial attachments, 
              connecting universities, students, and industry partners.
            </p>
            <div className="space-y-2 text-background/70 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@trackmyattachment.co.ke</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+254 712 345 678</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-background mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-background/60 hover:text-background transition-colors text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            © 2025 TrackMyAttachment. All rights reserved.
          </p>
          <p className="text-background/40 text-sm">
            A project by Joseph Ngigi Njoroge • Mama Ngina University College
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
