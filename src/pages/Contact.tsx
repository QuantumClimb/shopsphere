
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, MessageCircle, Facebook, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "../contexts/LanguageContext";
import { useSEO } from "../hooks/useSEO";

const Contact = () => {
  const { t } = useLanguage();
  
  useSEO({
    title: 'Contact Us | SHOPSPHERE',
    description: 'Contact SHOPSPHERE for product inquiries, orders, or customer support.',
    keywords: 'contact perfume store, fragrance inquiries, perfume customer support, perfume shop contact',
    canonicalUrl: 'https://www.fumeslane.com/contact'
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    toast({
      title: t('contact.success'),
      description: t('contact.successDesc'),
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Contact Content */}
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* QR Code for Reviews */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-foreground text-center">
                {t('contact.scanReviews')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <img 
                src="/images/QR.jpg" 
                alt="Scan QR Code for Reviews" 
                className="w-full mx-auto rounded-lg"
              />
            </CardContent>
          </Card>

          {/* WhatsApp Card */}
          <div className="space-y-8">
            <Card className="bg-secondary/10 border-secondary/20 neon-glow">
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4 text-foreground">{t('contact.quickContact')}</h3>
                <p className="text-foreground/80 mb-6">
                  {t('contact.quickContactDesc')}
                </p>
                <Button
                  onClick={() => {
                    const message = encodeURIComponent(
                      t('contact.whatsappMessage')
                    );
                    window.open(`https://wa.me/919789909362?text=${message}`, "_blank");
                  }}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 text-lg neon-glow"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t('contact.whatsappUs')}
                </Button>
              </CardContent>
            </Card>

            {/* Social Media Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-6 text-foreground">{t('contact.followUs')}</h3>
                <div className="flex space-x-8 justify-center">
                  <a href="https://www.facebook.com/fumeslane" target="_blank" rel="noopener noreferrer" 
                     className="transition-all hover:opacity-80 hover:scale-110 p-3" style={{ color: '#D4AF37' }}>
                    <Facebook className="w-12 h-12" />
                  </a>
                  <a href="https://www.instagram.com/fumeslane/" target="_blank" rel="noopener noreferrer"
                     className="transition-all hover:opacity-80 hover:scale-110 p-3" style={{ color: '#D4AF37' }}>
                    <Instagram className="w-12 h-12" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Section */}
  <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Visit Our Showroom</h2>
            <p className="text-xl text-foreground/80">
              Experience our exclusive collection of fragrances in person
            </p>
          </div>
          
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow overflow-hidden">
            <CardContent className="p-0">
              <div className="w-full h-96 relative bg-primary/5 flex items-center justify-center">
                <div className="text-center p-8">
                  <MapPin className="w-16 h-16 text-primary/20 mx-auto mb-4" />
                  <p className="text-foreground/60 text-lg">Online Exclusive Store</p>
                  <p className="text-foreground/40">Ships from Chennai, India</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Contact;
