import { useState } from 'react'
import { AppShell } from '@/components/common/AppShell'
import { Button } from '@/components/common/Button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { CLUB_CONFIG } from '@/config/clubConfig'

export default function Settings() {
  const [editing, setEditing] = useState(false)
  const [confirmingSave, setConfirmingSave] = useState(false)

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-navy-800">Settings</h1>
        <p className="text-sm text-slate-500">
          Fixed university and club information used on every generated circular.
        </p>
      </div>

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        These values are official records and are read from the application configuration
        (<code>src/config/clubConfig.ts</code>) in Phase 1. Editing here is disabled by default to
        prevent accidental changes to circulars already in circulation — see the README for how to
        update them directly in code.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SettingsSection title="University Information">
          <ReadOnlyField label="University Name" value={CLUB_CONFIG.universityName} />
          <ReadOnlyField label="Department" value={CLUB_CONFIG.departmentName} />
          <ReadOnlyField label="Website" value={CLUB_CONFIG.website} />
          <ReadOnlyField label="Email" value={CLUB_CONFIG.email} />
          <ReadOnlyField label="Address" value={CLUB_CONFIG.address.join(' ')} />
        </SettingsSection>

        <SettingsSection title="Club Information">
          <ReadOnlyField label="Club Name" value={CLUB_CONFIG.clubName} />
        </SettingsSection>

        <SettingsSection title="Officials">
          <ReadOnlyField label="Faculty Coordinator" value={CLUB_CONFIG.facultyCoordinator} />
          <ReadOnlyField label="HOD" value={CLUB_CONFIG.hod} />
          <ReadOnlyField label="Club President" value={CLUB_CONFIG.clubPresident} />
        </SettingsSection>

        <SettingsSection title="Branding">
          <div className="flex gap-6">
            <LogoPreview label="University Logo" src={CLUB_CONFIG.universityLogoPath} />
            <LogoPreview label="ARVR Club Logo" src={CLUB_CONFIG.clubLogoPath} />
          </div>
          <p className="text-xs text-slate-500">
            To replace a logo, upload a new PNG to Firebase Storage or overwrite the file at{' '}
            <code>public/assets/pragati-logo.png</code> / <code>public/assets/arvr-logo.png</code>{' '}
            and redeploy. See the README for details.
          </p>
        </SettingsSection>
      </div>

      <div className="mt-6">
        <Button variant="secondary" onClick={() => setEditing(true)} disabled>
          Edit official information
        </Button>
      </div>

      <ConfirmDialog
        open={editing && confirmingSave}
        title="Confirm changes"
        description="You are about to change official university/club information shown on every circular. This action requires editing src/config/clubConfig.ts directly in Phase 1."
        onConfirm={() => {
          setConfirmingSave(false)
          setEditing(false)
        }}
        onCancel={() => setConfirmingSave(false)}
      />
    </AppShell>
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-navy-700">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-sm text-slate-800">{value}</p>
    </div>
  )
}

function LogoPreview({ label, src }: { label: string; src: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
        <img
          src={src}
          alt={label}
          className="h-12 w-12 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
