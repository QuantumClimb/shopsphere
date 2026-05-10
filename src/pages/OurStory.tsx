import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, FlaskConical, Leaf, Users, Calendar, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEO } from "../hooks/useSEO";

const OurStory = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  useSEO({
    title: 'SHOPSPHERE',
    description: 'Discover the SHOPSPHERE brand, story, and product experience.',
    keywords: 'luxury perfume, designer fragrances, niche perfumes, buy perfume online, fragrance store, perfume shop',
    canonicalUrl: 'https://www.fumeslane.com/'
  });

  const values = [
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: t('ourStory.heritage.title'),
      description: t('ourStory.heritage.description')
    },
    {
      icon: <FlaskConical className="w-12 h-12" />,
      title: t('ourStory.excellence.title'),
      description: t('ourStory.excellence.description')
    },
    {
      icon: <Leaf className="w-12 h-12" />,
      title: t('ourStory.ingredients.title'),
      description: t('ourStory.ingredients.description')
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: t('ourStory.hospitality.title'),
      description: t('ourStory.hospitality.description')
    }
  ];

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: t('ourStory.features.recipes.title'),
      description: t('ourStory.features.recipes.description')
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: t('ourStory.features.fresh.title'),
      description: t('ourStory.features.fresh.description')
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: t('ourStory.features.dining.title'),
      description: t('ourStory.features.dining.description')
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t('ourStory.features.family.title'),
      description: t('ourStory.features.family.description')
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section
        className="relative h-96 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/banners/OurStoryBanner.png')`
        }}
      >
      </section>

      {/* Welcome Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            {t('ourStory.title')}
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed">
            {t('ourStory.subtitle')}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-primary/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-primary">
              {t('ourStory.storyTitle')}
            </h2>
            <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
              <p>
                {t('ourStory.story1')}
              </p>
              <p>
                {t('ourStory.story2')}
              </p>
              <p>
                {t('ourStory.story3')}
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="/images/banners/OurStory1.png"
              alt="SHOPSPHERE Story"
              className="rounded-lg shadow-2xl w-full h-96 object-cover neon-glow"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            {t('ourStory.experienceTitle')}
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            {t('ourStory.experienceSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
              <CardContent className="p-6 text-center">
                <div className="text-primary mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary">
                  {feature.title}
                </h3>
                <p className="text-foreground/70">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              {t('ourStory.valuesTitle')}
            </h2>
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              {t('ourStory.valuesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20 neon-glow">
                <CardContent className="p-8">
                  <div className="text-primary mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-primary">
                    {value.title}
                  </h3>
                  <p className="text-foreground/70 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tradition Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img
              src="/images/banners/recommend.jpg"
              alt="SHOPSPHERE Experience"
              className="rounded-lg shadow-2xl w-full h-96 object-cover neon-glow"
            />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              {t('ourStory.traditionTitle')}
            </h2>
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              {t('ourStory.traditionText1')}
            </p>
            <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
              {t('ourStory.traditionText2')}
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto bg-accent/10">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-primary">
            {t('ourStory.visionTitle')}
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl text-foreground/80 leading-relaxed mb-8">
              {t('ourStory.visionText')}
            </p>
            <blockquote className="text-2xl font-medium text-primary/80 italic border-l-4 border-primary pl-6 my-8">
              "{t('ourStory.visionQuote')}"
            </blockquote>
            <p className="text-lg text-foreground/70 mb-8">
              {t('ourStory.visionClosing')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            {t('ourStory.ctaTitle')}
          </h2>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            {t('ourStory.ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3 neon-glow"
              size="lg"
            >
              Contact Us
            </Button>
            <Button
              onClick={() => navigate("/menu")}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-3"
              size="lg"
            >
              Browse Collection
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurStory;
