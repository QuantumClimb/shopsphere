
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSEO } from "../hooks/useSEO";

const Gallery = () => {
  useSEO({
    title: 'Gallery | SHOPSPHERE',
    description: 'Explore the SHOPSPHERE product gallery and visuals.',
    keywords: 'products gallery, product photos, premium products, SHOPSPHERE',
    canonicalUrl: 'https://www.fumeslane.com/gallery'
  });
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    { src: "/images/fragrances/_0000_Afternoon_Swim.png", alt: "Afternoon Swim" },
    { src: "/images/fragrances/_0001_J'adore.png", alt: "J'adore" },
    { src: "/images/fragrances/_0002_Delina-La-Rosee.png", alt: "Delina La Rosee" },
    { src: "/images/fragrances/_0003_BecauseItsYou.png", alt: "Because Its You" },
    { src: "/images/fragrances/_0004_GoodGirl.png", alt: "Good Girl" },
    { src: "/images/fragrances/_0005_SilverMountainWater.png", alt: "Silver Mountain Water" },
    { src: "/images/fragrances/_0006_Eilish.png", alt: "Eilish" },
    { src: "/images/fragrances/_0007_ManInBlack.png", alt: "Man In Black" },
    { src: "/images/fragrances/_0008_Wanted.png", alt: "Wanted" },
    { src: "/images/fragrances/_0009_Sauvage.png", alt: "Sauvage" },
    { src: "/images/fragrances/_0010_TobaccoVanille.png", alt: "Tobacco Vanille" },
    { src: "/images/fragrances/_0011_Ice.png", alt: "Ice" },
  ];

  const openLightbox = (imageSrc: string) => {
    const index = images.findIndex(img => img.src === imageSrc);
    setCurrentIndex(index);
    setSelectedImage(imageSrc);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + images.length) % images.length
      : (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex].src);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Photo Gallery */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group cursor-pointer neon-glow"
              onClick={() => openLightbox(image.src)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
          <div className="relative">
            <img
              src={selectedImage || ""}
              alt="Gallery Image"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
