import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
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
                At SHOPSPHERE, we are committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
                you use our website and services.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p className="font-semibold">Personal Information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Delivery address and location information</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Order history and preferences</li>
              </ul>
              
              <p className="font-semibold mt-4">Technical Information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Usage data and interaction with our website</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about your orders and services</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our website, products, and services</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Detect and prevent fraud or unauthorized activities</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>We may share your information with:</p>
              
              <p className="font-semibold mt-4">Service Providers:</p>
              <p>
                Third-party companies that help us operate our business, such as payment processors, 
                delivery services, and website hosting providers. These providers are contractually 
                obligated to protect your information.
              </p>
              
              <p className="font-semibold mt-4">Legal Requirements:</p>
              <p>
                When required by law, legal process, or government request, or to protect our rights, 
                property, or safety.
              </p>
              
              <p className="font-semibold mt-4">Business Transfers:</p>
              <p>
                In connection with a merger, acquisition, or sale of assets, your information may be 
                transferred to the acquiring entity.
              </p>
              
              <p className="mt-4">
                We do not sell your personal information to third parties for marketing purposes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>4. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                We use cookies and similar technologies to enhance your experience, analyze site usage, 
                and assist in our marketing efforts.
              </p>
              <p>
                You can control cookies through your browser settings. However, disabling cookies may 
                affect the functionality of our website.
              </p>
              <p className="font-semibold mt-4">Types of cookies we use:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Necessary for website functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                Payment information is processed through secure, PCI-compliant payment gateways. We do not 
                store complete credit card information on our servers.
              </p>
              <p>
                However, no method of transmission over the internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>6. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>Under applicable data protection laws, you have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Objection:</strong> Object to processing of your information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing communications</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at support@shopsphere.app
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>7. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes 
                outlined in this Privacy Policy, unless a longer retention period is required by law.
              </p>
              <p>
                Order information is typically retained for accounting and legal compliance purposes.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>8. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                Our services are not directed to individuals under the age of 18. We do not knowingly 
                collect personal information from children. If we become aware that we have collected 
                information from a child, we will take steps to delete it promptly.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>9. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                Your information may be transferred to and processed in countries other than Portugal. 
                We ensure appropriate safeguards are in place to protect your information in accordance 
                with applicable data protection laws.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>10. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material 
                changes by posting the updated policy on our website with a new "Last Updated" date.
              </p>
              <p>
                Your continued use of our services after changes have been posted constitutes acceptance 
                of the updated policy.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>Email:</strong> support@shopsphere.app</li>
                <li><strong>Phone:</strong> +351 920 617 185</li>
                <li><strong>Address:</strong> R. Agostinho Lourenço 339, 1000-011 Lisboa, Portugal</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;


