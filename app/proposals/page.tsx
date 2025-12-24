/**
 * 🗳️ Proposals Page - REDIRECT
 *
 * Redirects to /tasks?tab=propose where proposals are now integrated
 */

import { redirect } from 'next/navigation'

export default function ProposalsPage() {
  redirect('/tasks?tab=propose')
}
