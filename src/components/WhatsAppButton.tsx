
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WhatsAppButton = () => {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "Hi SHOPSPHERE! I have a question about your products and would like some help."
    );
    window.open(`https://wa.me/919789909362?text=${message}`, "_blank");
  };

  return (
    <Button
      onClick={handleWhatsApp}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-secondary hover:bg-secondary/90 shadow-lg neon-glow animate-float"
      size="sm"
    >
      <MessageCircle className="w-6 h-6 text-secondary-foreground" />
    </Button>
  );
};
