const CRMPage = () => {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500">
          Monitor the health of the pipeline and keep the team aligned.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Leads</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">47</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Qualified This Week</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">12</p>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Follow-Ups</p>
          <p className="mt-3 text-3xl font-semibold text-slate-900">8</p>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Team snapshot
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Use this space to review conversion trends, recent activity, and
          coaching opportunities as the rest of the CRM grows.
        </p>
      </section>
    </div>
  )
}

export default CRMPage;
