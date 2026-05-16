import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsConditions = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Content Section */}
      <section className="py-16 px-4 max-w-5xl mx-auto">
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6">
              <p className="text-foreground/70 mb-4">
                <strong>Last Updated:</strong> November 3, 2025
              </p>
              <p className="text-foreground/80 leading-relaxed">
                Welcome to LUXURY LINE. By accessing and using our website and services, 
                you agree to be bound by these Terms and Conditions. Please read them carefully.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>1. General Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                These terms govern your use of our website, online ordering system, and services provided by 
                LUXURY LINE, located at R. Agostinho Louren�o 339, 1000-011 Lisboa, Portugal.
              </p>
              <p>
                By placing an order, you confirm that you are at least 18 years of age and have the legal 
                capacity to enter into this agreement.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>2. Orders and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                All orders placed through our website or by phone are subject to acceptance and availability. 
                We reserve the right to refuse or cancel any order at our discretion.
              </p>
              <p>
                Prices displayed on our website are in Indian Rupees (₹) and include applicable taxes unless otherwise stated. 
                Payment must be completed at the time of ordering for online orders.
              </p>
              <p>
                We accept major credit and debit cards through secure payment processing. All payment information 
                is encrypted and handled in accordance with industry standards.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>3. Delivery Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                Delivery times are estimates and may vary based on distance, traffic, and order volume. 
                We strive to deliver within the stated timeframe but cannot guarantee exact delivery times.
              </p>
              <p>
                Delivery is available within our designated service areas. Minimum order values and delivery 
                fees may apply based on location.
              </p>
              <p>
                You must provide accurate delivery information. We are not responsible for delays or failed 
                deliveries due to incorrect addresses or unavailability at the delivery location.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>4. Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                We make every effort to display accurate product descriptions, images, and prices. However, 
                we cannot guarantee that all information is error-free, complete, or current.
              </p>
              <p>
                Food items are prepared in a kitchen that handles various allergens. While we take precautions, 
                we cannot guarantee that dishes are completely free from allergens.
              </p>
              <p>
                Menu items and availability are subject to change without notice.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>5. User Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                You agree to use our website and services only for lawful purposes and in accordance with these terms.
              </p>
              <p>
                You must not misuse our services, interfere with their operation, or attempt to access systems 
                or data without authorization.
              </p>
              <p>
                Any fraudulent, abusive, or otherwise illegal activity may be grounds for termination of your 
                access to our services and may be reported to law enforcement.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>6. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                All content on our website, including text, images, logos, and design elements, is the property 
                of LUXURY LINE or its licensors and is protected by copyright and trademark laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative works from any content without 
                our express written permission.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                To the fullest extent permitted by law, LUXURY LINE shall not be liable for any indirect, 
                incidental, special, or consequential damages arising from your use of our services.
              </p>
              <p>
                Our total liability for any claims relating to our services shall not exceed the amount paid by 
                you for the specific order giving rise to the claim.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>8. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective 
                immediately upon posting to our website.
              </p>
              <p>
                Your continued use of our services after changes have been posted constitutes acceptance of the 
                modified terms.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>9. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                These Terms and Conditions are governed by the laws of Portugal. Any disputes shall be subject 
                to the exclusive jurisdiction of the courts of Lisboa, Portugal.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>Address:</strong> R. Agostinho Lourenço 339, 1000-011 Lisboa, Portugal</li>
                <li><strong>Phone:</strong> +351 920 617 185</li>
                <li><strong>Email:</strong> support@luxury-line.app</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default TermsConditions;


