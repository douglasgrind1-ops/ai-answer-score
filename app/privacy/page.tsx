export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-3">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
            Privacy
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-lg leading-8 text-slate-600">
            AI Answer Score analyzes user-provided AI answers to generate
            reliability scores, reasoning audits, and improved prompts.
          </p>
        </div>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-bold">What we collect</h2>
          <p className="leading-8 text-slate-700">
            We collect the question and answer text that a user chooses to
            analyze.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-bold">How we use it</h2>
          <p className="leading-8 text-slate-700">
            We use submitted information only to generate analysis results,
            including scoring, reasoning feedback, and improved prompts.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-bold">Data sharing</h2>
          <p className="leading-8 text-slate-700">
            We do not sell personal data. Submitted content may be sent to our
            analysis providers solely to process the requested analysis.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-bold">Data retention</h2>
          <p className="leading-8 text-slate-700">
            We retain submitted content only as long as needed to operate,
            secure, and improve the service, unless a longer retention period is
            required for legal or security reasons.
          </p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-2xl font-bold">Contact</h2>
          <p className="leading-8 text-slate-700">
            For privacy questions, contact: YOUR_EMAIL
          </p>
        </section>
      </div>
    </main>
  );
}
