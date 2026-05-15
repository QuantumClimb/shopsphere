import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CancellationRefund = () => {
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
                At SHOPSPHERE, we want you to be completely satisfied with your order. 
                This policy outlines our procedures for order cancellations and refunds.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>1. Order Cancellation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p className="font-semibold">Before Order Preparation:</p>
              <p>
                You may cancel your order free of charge if you contact us immediately after placing 
                the order and before food preparation has begun. Please call us at +351 920 617 185 
                as soon as possible.
              </p>
              
              <p className="font-semibold mt-4">After Order Preparation Has Started:</p>
              <p>
                Once your order has entered the preparation stage, we cannot accept cancellations as 
                ingredients have been allocated and cooking has commenced.
              </p>
              
              <p className="font-semibold mt-4">How to Cancel:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Call us immediately at +351 920 617 185</li>
                <li>Provide your order number and contact information</li>
                <li>Our team will confirm if cancellation is possible</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>2. Refund Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p className="font-semibold">Eligible Refund Scenarios:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Order cancelled before preparation begins</li>
                <li>Incorrect items delivered</li>
                <li>Poor quality or spoiled food</li>
                <li>Order not delivered within a reasonable timeframe without notification</li>
                <li>Significant errors in order fulfillment</li>
              </ul>
              
              <p className="font-semibold mt-4">Non-Refundable Situations:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Change of mind after preparation has started</li>
                <li>Unavailability at delivery address (after multiple delivery attempts)</li>
                <li>Incorrect address provided by customer</li>
                <li>Food consumed or packaging opened (unless quality issue reported immediately)</li>
                <li>Minor variations in taste or presentation that do not affect food quality</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>3. Refund Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p className="font-semibold">Step 1: Contact Us</p>
              <p>
                Contact us within 24 hours of order delivery or failed delivery via:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Phone: +351 920 617 185</li>
                <li>Email: support@shopsphere.app</li>
              </ul>
              
              <p className="font-semibold mt-4">Step 2: Provide Details</p>
              <p>
                Please provide:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Order number</li>
                <li>Description of the issue</li>
                <li>Photos of the order (if applicable)</li>
                <li>Contact information</li>
              </ul>
              
              <p className="font-semibold mt-4">Step 3: Review</p>
              <p>
                Our team will review your request within 24-48 hours and determine eligibility for refund.
              </p>
              
              <p className="font-semibold mt-4">Step 4: Resolution</p>
              <p>
                If approved, we will process your refund or offer an alternative resolution such as 
                a replacement order or store credit.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>4. Refund Methods and Timing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p className="font-semibold">Refund Methods:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Original payment method (for card payments)</li>
                <li>Store credit for future orders</li>
                <li>Bank transfer (in certain cases)</li>
              </ul>
              
              <p className="font-semibold mt-4">Processing Time:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Card Refunds:</strong> 5-10 business days (depending on your bank)</li>
                <li><strong>Store Credit:</strong> Applied immediately to your account</li>
                <li><strong>Bank Transfer:</strong> 3-5 business days</li>
              </ul>
              
              <p className="mt-4">
                Please note that the time it takes for the refund to appear in your account may vary 
                depending on your financial institution.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>5. Partial Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                Partial refunds may be issued in cases where:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Only part of the order is affected by quality issues</li>
                <li>Missing items from a larger order</li>
                <li>Minor issues that don't warrant a full refund</li>
              </ul>
              <p className="mt-4">
                The refund amount will be proportional to the affected portion of the order.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>6. Delivery Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p className="font-semibold">Significantly Delayed Orders:</p>
              <p>
                If your order is significantly delayed beyond the estimated delivery time without 
                notification, you may be eligible for a refund or credit.
              </p>
              
              <p className="font-semibold mt-4">Failed Delivery Attempts:</p>
              <p>
                If we cannot deliver your order due to unavailability or incorrect address information 
                provided by you, we reserve the right to charge a re-delivery fee or cancel the order 
                without refund.
              </p>
              
              <p className="font-semibold mt-4">Weather or External Factors:</p>
              <p>
                In cases of severe weather or circumstances beyond our control, we will do our best to 
                deliver your order or contact you to reschedule. Refunds will be processed if delivery 
                is not possible.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>7. Quality Guarantee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                We take food quality seriously. If you receive an order that does not meet our quality 
                standards, please:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Contact us immediately upon receiving the order</li>
                <li>Do not consume the affected items</li>
                <li>Take photos of the issue if possible</li>
                <li>Keep all packaging until the issue is resolved</li>
              </ul>
              <p className="mt-4">
                We will arrange for a replacement or full refund for verified quality issues.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>8. Promotional Orders and Discounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                For orders placed with promotional codes or discounts:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Refunds will be processed for the amount actually paid</li>
                <li>Promotional codes may not be reissued if order is cancelled</li>
                <li>Store credit will reflect the discounted amount paid</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>9. Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                If you are not satisfied with our resolution to your refund request, please escalate 
                the matter by contacting our management team at support@shopsphere.app with 
                "Refund Dispute" in the subject line.
              </p>
              <p className="mt-4">
                We will review all disputes fairly and respond within 3-5 business days.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>10. Modifications to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                We reserve the right to modify this Cancellation and Refund Policy at any time. 
                Changes will be effective immediately upon posting to our website.
              </p>
              <p className="mt-4">
                The policy in effect at the time of your order will apply to that specific transaction.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-foreground/80 leading-relaxed">
              <p>
                For any questions about our Cancellation and Refund Policy, please contact:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>Phone:</strong> +351 920 617 185 (Mon-Sat: 11 AM - 10 PM, Closed Sundays)</li>
                <li><strong>Email:</strong> support@shopsphere.app</li>
                <li><strong>Address:</strong> R. Agostinho Lourenço 339, 1000-011 Lisboa, Portugal</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-center font-semibold text-lg mb-4">
                Your Satisfaction is Our Priority
              </p>
              <p className="text-center text-foreground/80">
                We strive to provide excellent food and service. If you're ever unsatisfied with your 
                order, please let us know immediately so we can make it right.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CancellationRefund;


