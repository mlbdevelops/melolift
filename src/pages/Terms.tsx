
import React from 'react';
import Layout from '../components/Layout';

const Terms = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-3">
              By accessing or using MeloLift, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-3">
              MeloLift provides an online platform for music production, mixing, and audio processing. We reserve the right to modify, suspend or discontinue the service at any time without notice.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-3">
              When you create an account with us, you must provide accurate and complete information. You are responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <p className="mb-3">
              You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">4. User Content</h2>
            <p className="mb-3">
              Our service allows you to upload, store, and share content including audio files, mixes, and other materials. You retain all rights to your content.
            </p>
            <p className="mb-3">
              By uploading content to MeloLift, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content in connection with the service.
            </p>
            <p className="mb-3">
              You are solely responsible for the content you upload and share. You agree not to upload content that infringes on intellectual property rights, contains explicit material, or violates any laws.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">5. Subscription and Payments</h2>
            <p className="mb-3">
              Some features of MeloLift are available on subscription basis. You agree to pay all fees and charges associated with your account.
            </p>
            <p className="mb-3">
              Subscription fees are billed in advance on a monthly or annual basis. You can cancel your subscription at any time, but no refunds will be provided for partial billing periods.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="mb-3">
              The service and its original content, features, and functionality are and will remain the exclusive property of MeloLift and its licensors.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">7. Termination</h2>
            <p className="mb-3">
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms.
            </p>
            <p className="mb-3">
              Upon termination, your right to use the service will immediately cease. If you wish to terminate your account, you may simply discontinue using the service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="mb-3">
              In no event shall MeloLift, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="mb-3">
              We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new Terms of Service on this page.
            </p>
            <p className="mb-3">
              Your continued use of the service after any such changes constitutes your acceptance of the new Terms of Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
            <p className="mb-3">
              If you have any questions about these Terms, please contact us.
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

export default Terms;
