import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageCircle, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CustomerSupport = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen pt-16">
      {/* Content Section */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="space-y-8">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                {t('customerSupport.howCanWeHelp')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                {t('customerSupport.helpDescription')}
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  {t('customerSupport.callUs')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">+351 920 617 185</p>
                <p className="text-foreground/70">
                  {t('customerSupport.callDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  {t('customerSupport.emailUs')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-primary mb-2">support@shopsphere.app</p>
                <p className="text-foreground/70">
                  {t('customerSupport.emailDescription')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {t('customerSupport.supportHours')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('customerSupport.phoneSupport')}</span>
                <span className="text-foreground/70">{t('customerSupport.phoneSupportHours')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium"></span>
                <span className="text-foreground/70 text-sm">{t('customerSupport.closedSundays')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('customerSupport.emailSupport')}</span>
                <span className="text-foreground/70">{t('customerSupport.emailSupportHours')}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>{t('customerSupport.faq')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{t('customerSupport.faqQuestion1')}</h3>
                <p className="text-foreground/70">
                  {t('customerSupport.faqAnswer1')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">{t('customerSupport.faqQuestion2')}</h3>
                <p className="text-foreground/70">
                  {t('customerSupport.faqAnswer2')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">{t('customerSupport.faqQuestion3')}</h3>
                <p className="text-foreground/70">
                  {t('customerSupport.faqAnswer3')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">{t('customerSupport.faqQuestion4')}</h3>
                <p className="text-foreground/70">
                  {t('customerSupport.faqAnswer4')}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">{t('customerSupport.faqQuestion5')}</h3>
                <p className="text-foreground/70">
                  {t('customerSupport.faqAnswer5')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CustomerSupport;

