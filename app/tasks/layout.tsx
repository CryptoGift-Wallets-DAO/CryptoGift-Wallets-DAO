/**
 * 📋 Tasks Section Layout
 *
 * Open access layout for tasks section - anyone can view tasks
 * CGC tokens only required for claiming/submitting (handled at action level)
 */

import { Navbar } from '@/components/layout/Navbar'

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Navbar always visible */}
      <Navbar />

      {/* Open access content - no token gating */}
      {children}
    </>
  )
}