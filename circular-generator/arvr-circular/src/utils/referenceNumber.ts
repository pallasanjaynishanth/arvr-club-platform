import { db } from '@/services/firebase'
import { doc, runTransaction } from 'firebase/firestore'

/**
 * Atomically generates the next circular reference number for the current
 * calendar year, in the form ARVR/YYYY/### (e.g. ARVR/2026/001).
 *
 * A single counters/{year} document tracks the last-used sequence number.
 * We use a Firestore transaction so two coordinators generating circulars
 * at (almost) the same moment never receive the same reference number.
 */
export async function getNextReferenceNumber(year: number): Promise<string> {
  const counterRef = doc(db, 'counters', String(year))

  const nextNumber = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef)
    const lastNumber = snapshot.exists() ? (snapshot.data().lastNumber as number) : 0
    const next = lastNumber + 1
    transaction.set(counterRef, { year, lastNumber: next }, { merge: true })
    return next
  })

  const padded = String(nextNumber).padStart(3, '0')
  return `ARVR/${year}/${padded}`
}
