/**
 * 🔍 Database Types for CryptoGift DAO
 * 
 * TypeScript types generated from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          task_id: string // bytes32 from contract
          title: string
          description: string | null
          complexity: number
          reward_cgc: number
          estimated_days: number
          platform: 'github' | 'discord' | 'manual' | 'custom'
          category: 'security' | 'frontend' | 'backend' | 'mobile' | 'ai' | 'defi' | 'governance' | 'analytics' | 'documentation' | 'blockchain' | 'nft' | 'performance' | 'testing' | 'localization' | 'social' | 'notifications' | 'treasury' | 'integration' | 'automation' | 'algorithm' | 'compliance' | 'infrastructure' | 'gamification' | 'search' | null
          priority: 'low' | 'medium' | 'high' | 'critical'
          status: 'available' | 'claimed' | 'in_progress' | 'submitted' | 'completed' | 'cancelled' | 'expired'
          required_skills: string[] | null
          tags: string[] | null
          assignee_address: string | null
          assignee_discord_id: string | null
          created_at: string
          updated_at: string
          claimed_at: string | null
          submitted_at: string | null
          completed_at: string | null
          evidence_url: string | null
          pr_url: string | null
          validation_hash: string | null
          validators: string[] | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          description?: string | null
          complexity: number
          reward_cgc: number
          estimated_days: number
          platform?: 'github' | 'discord' | 'manual' | 'custom'
          category?: 'security' | 'frontend' | 'backend' | 'mobile' | 'ai' | 'defi' | 'governance' | 'analytics' | 'documentation' | 'blockchain' | 'nft' | 'performance' | 'testing' | 'localization' | 'social' | 'notifications' | 'treasury' | 'integration' | 'automation' | 'algorithm' | 'compliance' | 'infrastructure' | 'gamification' | 'search' | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'available' | 'claimed' | 'in_progress' | 'submitted' | 'completed' | 'cancelled' | 'expired'
          required_skills?: string[] | null
          tags?: string[] | null
          assignee_address?: string | null
          assignee_discord_id?: string | null
          created_at?: string
          updated_at?: string
          claimed_at?: string | null
          submitted_at?: string | null
          completed_at?: string | null
          evidence_url?: string | null
          pr_url?: string | null
          validation_hash?: string | null
          validators?: string[] | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          description?: string | null
          complexity?: number
          reward_cgc?: number
          estimated_days?: number
          platform?: 'github' | 'discord' | 'manual' | 'custom'
          category?: 'security' | 'frontend' | 'backend' | 'mobile' | 'ai' | 'defi' | 'governance' | 'analytics' | 'documentation' | 'blockchain' | 'nft' | 'performance' | 'testing' | 'localization' | 'social' | 'notifications' | 'treasury' | 'integration' | 'automation' | 'algorithm' | 'compliance' | 'infrastructure' | 'gamification' | 'search' | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'available' | 'claimed' | 'in_progress' | 'submitted' | 'completed' | 'cancelled' | 'expired'
          required_skills?: string[] | null
          tags?: string[] | null
          assignee_address?: string | null
          assignee_discord_id?: string | null
          created_at?: string
          updated_at?: string
          claimed_at?: string | null
          submitted_at?: string | null
          completed_at?: string | null
          evidence_url?: string | null
          pr_url?: string | null
          validation_hash?: string | null
          validators?: string[] | null
          metadata?: Json | null
        }
      }
      collaborators: {
        Row: {
          address: string
          discord_id: string | null
          github_username: string | null
          total_cgc_earned: number
          tasks_completed: number
          tasks_in_progress: number
          rank: number | null
          level: 'novice' | 'contributor' | 'expert' | 'master' | 'legend'
          badges: string[] | null
          created_at: string
          updated_at: string
          last_activity: string | null
        }
        Insert: {
          address: string
          discord_id?: string | null
          github_username?: string | null
          total_cgc_earned?: number
          tasks_completed?: number
          tasks_in_progress?: number
          rank?: number | null
          level?: 'novice' | 'contributor' | 'expert' | 'master' | 'legend'
          badges?: string[] | null
          created_at?: string
          updated_at?: string
          last_activity?: string | null
        }
        Update: {
          address?: string
          discord_id?: string | null
          github_username?: string | null
          total_cgc_earned?: number
          tasks_completed?: number
          tasks_in_progress?: number
          rank?: number | null
          level?: 'novice' | 'contributor' | 'expert' | 'master' | 'legend'
          badges?: string[] | null
          created_at?: string
          updated_at?: string
          last_activity?: string | null
        }
      }
      task_proposals: {
        Row: {
          id: string
          title: string
          description: string
          proposed_by_address: string | null
          proposed_by_discord: string | null
          platform_origin: string
          estimated_complexity: number | null
          estimated_days: number | null
          status: 'pending' | 'approved' | 'rejected' | 'reviewing'
          review_notes: string | null
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          proposed_by_address?: string | null
          proposed_by_discord?: string | null
          platform_origin: string
          estimated_complexity?: number | null
          estimated_days?: number | null
          status?: 'pending' | 'approved' | 'rejected' | 'reviewing'
          review_notes?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          proposed_by_address?: string | null
          proposed_by_discord?: string | null
          platform_origin?: string
          estimated_complexity?: number | null
          estimated_days?: number | null
          status?: 'pending' | 'approved' | 'rejected' | 'reviewing'
          review_notes?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_history: {
        Row: {
          id: string
          task_id: string
          action: 'created' | 'claimed' | 'submitted' | 'validated' | 'completed' | 'expired'
          actor_address: string | null
          actor_discord: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          action: 'created' | 'claimed' | 'submitted' | 'validated' | 'completed' | 'expired'
          actor_address?: string | null
          actor_discord?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          action?: 'created' | 'claimed' | 'submitted' | 'validated' | 'completed' | 'expired'
          actor_address?: string | null
          actor_discord?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          address: string
          discord_id: string | null
          github_username: string | null
          total_cgc_earned: number
          tasks_completed: number
          level: string
          rank: number
        }
      }
      active_tasks_view: {
        Row: {
          task_id: string
          title: string
          assignee_address: string
          assignee_discord_id: string | null
          estimated_completion: string
          progress_percentage: number
        }
      }
    }
    Functions: {
      calculate_rank: {
        Args: Record<string, never>
        Returns: void
      }
      get_available_tasks: {
        Args: {
          user_address?: string
        }
        Returns: {
          id: string
          title: string
          description: string
          complexity: number
          reward_cgc: number
          estimated_days: number
        }[]
      }
      claim_task: {
        Args: {
          p_task_id: string
          p_user_address: string
        }
        Returns: boolean
      }
      submit_task_evidence: {
        Args: {
          p_task_id: string
          p_evidence_url: string
          p_pr_url?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      task_status: 'available' | 'in_progress' | 'completed' | 'expired'
      task_platform: 'github' | 'discord' | 'manual' | 'custom'
      collaborator_level: 'novice' | 'contributor' | 'expert' | 'master' | 'legend'
      proposal_status: 'pending' | 'approved' | 'rejected' | 'reviewing'
      task_action: 'created' | 'claimed' | 'submitted' | 'validated' | 'completed' | 'expired'
    }
  }
}

// Helper types
export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

export type Collaborator = Database['public']['Tables']['collaborators']['Row']
export type CollaboratorInsert = Database['public']['Tables']['collaborators']['Insert']
export type CollaboratorUpdate = Database['public']['Tables']['collaborators']['Update']

export type TaskProposal = Database['public']['Tables']['task_proposals']['Row']
export type TaskProposalInsert = Database['public']['Tables']['task_proposals']['Insert']
export type TaskProposalUpdate = Database['public']['Tables']['task_proposals']['Update']

export type TaskHistory = Database['public']['Tables']['task_history']['Row']
export type TaskHistoryInsert = Database['public']['Tables']['task_history']['Insert']

// Enums
export type TaskStatus = Database['public']['Enums']['task_status']
export type TaskPlatform = Database['public']['Enums']['task_platform']
export type CollaboratorLevel = Database['public']['Enums']['collaborator_level']
export type ProposalStatus = Database['public']['Enums']['proposal_status']
export type TaskAction = Database['public']['Enums']['task_action']