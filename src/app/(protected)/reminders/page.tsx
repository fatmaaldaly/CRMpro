
import React from 'react'
import { RemindersPageClient } from '@/components/reminders/reminders-page-client';

export default function RemindersPage() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          My Reminders
        </h1>
      </div>

      <RemindersPageClient />
    </div>
  )
};
