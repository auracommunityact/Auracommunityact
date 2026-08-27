import { siteConfig } from "../config";

export default function Terms() {
  return (
    <div className="pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Terms of Use</h1>
        
        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the {siteConfig.name} website, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Purpose of the Website</h2>
            <p>
              The {siteConfig.name} website is an informational and community-driven platform designed to showcase our digital projects, services, and initiatives. 
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, images, and software, is the property of {siteConfig.name} or its content suppliers and is protected by relevant copyright laws, unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. User Conduct</h2>
            <p>
              You agree to use the website only for lawful purposes. You are prohibited from violating or attempting to violate the security of the website or engaging in any activity that disrupts the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Disclaimer</h2>
            <p>
              The materials on {siteConfig.name}'s website are provided on an 'as is' basis. {siteConfig.name} makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties or conditions of merchantability.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
