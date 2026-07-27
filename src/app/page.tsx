import PricingCalculator from "@/components/PricingCalculator";

const WHY_CHOOSE_US = [
  {
    title: "Complete Core, Every Tier",
    body: "Every subscriber — from Foundation to Summit — receives full job-card lifecycle management, never a limited trial-like experience.",
  },
  {
    title: "Usage-Aligned Add-On Pricing",
    body: "Add-ons are priced on the actual resource they consume (storage, messages, transactions, headcount) — not arbitrary feature bundles.",
  },
  {
    title: "Transparent Bundle Discounts",
    body: "GMS subscribers receive built-in discounts on integrated add-ons, rewarding platform loyalty without inflating standalone pricing.",
  },
  {
    title: "Scalable Support Model",
    body: "Support responsiveness scales with your tier — from next-business-day chat support up to 24×7 priority coverage with quarterly business reviews.",
  },
  {
    title: "No Long-Term Lock-In Required",
    body: "Month-to-month billing available at every tier, with an annual prepayment discount for customers who want to commit long-term.",
  },
  {
    title: "Built for Growth",
    body: "Clear upgrade paths mean your platform grows with your workshop — from a single bay to a multi-location enterprise chain — without a disruptive system migration.",
  },
];

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-slate-900">GaragePro360</div>
            <div className="text-xs text-slate-500">
              Pricing Calculator — Executive Guide
            </div>
          </div>
          <a
            href="#tiers"
            className="text-sm rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition"
          >
            Build my plan
          </a>
        </div>
      </header>

      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold max-w-2xl">
            See your GaragePro360 cost in real time
          </h1>
          <p className="mt-3 text-blue-100 max-w-2xl">
            Pick a subscription tier and the add-ons your workshop needs — the
            estimate updates instantly, itemized just like your invoice would be.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        <PricingCalculator />
      </main>

      <section className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Why choose us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WHY_CHOOSE_US.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 p-4">
                <div className="font-medium text-slate-900">{item.title}</div>
                <p className="text-sm text-slate-500 mt-1">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm">
            © GaragePro360. All prices in INR, USD shown as approximate.
          </div>
          <div className="text-sm space-x-4">
            <a href="mailto:sales@garagepro360.example" className="hover:text-white">
              sales@garagepro360.example
            </a>
            <span>+91-XXXXXXXXXX</span>
            <span>www.garagepro360.example</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
