/**
 * 📋 Tasks Section Layout
 * 
 * Protected layout for tasks section with CGC token requirement
 */

import { CGCAccessGate } from '@/components/auth/CGCAccessGate'

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CGCAccessGate
      requiredBalance="0.01"
      title="🎯 Tasks & Rewards Access"
      description="Access to the CryptoGift DAO tasks and rewards system requires holding CGC tokens. Connect your wallet and hold at least 0.01 CGC to participate in tasks and earn rewards."
    >
      {children}
    </CGCAccessGate>
  )
}