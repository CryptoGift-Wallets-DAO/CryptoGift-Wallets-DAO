/**
 * 🏆 Leaderboard Table Component
 * 
 * Shows collaborator rankings
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, Medal, Award, User } from 'lucide-react'
import type { Collaborator } from '@/lib/supabase/types'

interface LeaderboardTableProps {
  userAddress?: string
  refreshKey?: number
}

interface LeaderboardEntry extends Collaborator {
  rank: number
}

export function LeaderboardTable({ userAddress, refreshKey = 0 }: LeaderboardTableProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)

  useEffect(() => {
    loadLeaderboard()
  }, [refreshKey, userAddress])

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/leaderboard${userAddress ? `?address=${userAddress}` : ''}`)
      const data = await response.json()
      
      if (data.success) {
        setLeaderboard(data.data.leaderboard || [])
        setUserRank(data.data.userRank || null)
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-semibold text-gray-500">#{rank}</span>
    }
  }

  const getLevelBadge = (level: string, cgc: number) => {
    if (cgc >= 10000) return { label: 'Legend', color: 'bg-purple-100 text-purple-800' }
    if (cgc >= 5000) return { label: 'Master', color: 'bg-red-100 text-red-800' }
    if (cgc >= 2000) return { label: 'Expert', color: 'bg-blue-100 text-blue-800' }
    if (cgc >= 500) return { label: 'Contributor', color: 'bg-green-100 text-green-800' }
    return { label: 'Novice', color: 'bg-gray-100 text-gray-800' }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User's Position (if not in top 10) */}
      {userRank && userRank.rank > 10 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Your Position</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getRankIcon(userRank.rank)}
              <div>
                <p className="font-semibold">{userRank.wallet_address?.slice(0, 8)}...{userRank.wallet_address?.slice(-6)}</p>
                <p className="text-sm text-blue-700">{userRank.total_cgc_earned.toFixed(2)} CGC</p>
              </div>
            </div>
            <Badge className={getLevelBadge('', userRank.total_cgc_earned).color}>
              {getLevelBadge('', userRank.total_cgc_earned).label}
            </Badge>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CGC Earned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tasks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Level
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((collaborator, index) => {
              const isUserRow = collaborator.wallet_address === userAddress
              const levelBadge = getLevelBadge('', collaborator.total_cgc_earned)
              
              return (
                <tr 
                  key={collaborator.wallet_address || collaborator.id}
                  className={`hover:bg-gray-50 ${isUserRow ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRankIcon(collaborator.rank || index + 1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className={`font-medium ${isUserRow ? 'text-blue-900' : 'text-gray-900'}`}>
                          {collaborator.wallet_address?.slice(0, 8)}...{collaborator.wallet_address?.slice(-6)}
                        </p>
                        {collaborator.discord_username && (
                          <p className="text-xs text-gray-500">Discord: {collaborator.discord_username}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {collaborator.total_cgc_earned.toFixed(2)} CGC
                      </p>
                      <p className="text-xs text-gray-500">
                        ~${(collaborator.total_cgc_earned * 0.1).toFixed(0)} USD
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-gray-900">{collaborator.tasks_completed}</p>
                      <p className="text-xs text-gray-500">
                        {collaborator.tasks_in_progress || 0} in progress
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${levelBadge.color} border-0`}>
                      {levelBadge.label}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No collaborators yet. Be the first to complete a task!</p>
        </div>
      )}
    </div>
  )
}