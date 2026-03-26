import React from 'react'
export default function RemindersPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Reminders
        </h1>
        <p className="text-sm text-slate-500">
          Keep follow-ups visible so nothing slips between conversations.
        </p>
      </div>

      <section className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Reminder queue coming soon
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          This shared shell now matches the rest of the CRM, and this page is
          ready for the reminder list and scheduling tools when you add them.
        </p>
      </section>
    </div>
  )
}
