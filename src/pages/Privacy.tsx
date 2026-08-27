import { siteConfig } from "../config";

export default function Privacy() {
  return (
    <div className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to {siteConfig.name}. This Privacy Policy explains how we collect, use, and handle your information when you use our website and services. We respect your privacy and are committed to protecting it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
            <p>
              When you use our Contact form, we collect the information you provide, such as your name, email address, and the contents of your message. This data is collected solely to respond to your inquiries and is not shared with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p>
              The information we collect is used in the following ways:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>To respond to your questions, comments, or collaboration requests.</li>
              <li>To improve our website and community initiatives.</li>
              <li>To keep you updated on community events if you explicitly opt-in.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Security</h2>
            <p>
              We implement reasonable security measures to protect the information you provide via our contact forms. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us via the Contact page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
