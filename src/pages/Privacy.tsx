
import React from 'react';
import Layout from '../components/Layout';

const Privacy = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-3">
              MeloLift ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="mb-3">
              We collect the following types of information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal information (name, email address, etc.) that you provide when you register for an account</li>
              <li>Payment information when you subscribe to premium features</li>
              <li>Content you upload or create on the platform</li>
              <li>Usage information and interaction with our service</li>
              <li>Technical data including IP address, browser type, device information</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features of our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To process payments and prevent fraudulent transactions</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">4. Data Sharing and Disclosure</h2>
            <p className="mb-3">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With service providers who perform services on our behalf</li>
              <li>For business transfers if we're involved in a merger, acquisition, or asset sale</li>
              <li>With affiliates and business partners with your consent</li>
              <li>If required by law or to protect our rights</li>
              <li>With your consent or at your direction</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-3">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">6. Your Data Protection Rights</h2>
            <p className="mb-3">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access your personal data</li>
              <li>The right to rectification of inaccurate personal data</li>
              <li>The right to erasure of your personal data</li>
              <li>The right to restrict processing of your personal data</li>
              <li>The right to data portability</li>
              <li>The right to object to processing of your personal data</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="mb-3">
              We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">8. Children's Privacy</h2>
            <p className="mb-3">
              Our service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
            <p className="mb-3">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
            <p className="mb-3">
              If you have any questions about this Privacy Policy, please contact us.
            </p>
          </section>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-light-100/60">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
