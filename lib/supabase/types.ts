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
          status: 'available' | 'claimed' | 'in_progress' | 'submitted' | 'validated' | 'completed' | 'cancelled' | 'expired'
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
          validated_at: string | null
          validator_address: string | null
          validation_notes: string | null
          rejected_at: string | null
          rejected_by: string | null
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
          status?: 'available' | 'claimed' | 'in_progress' | 'submitted' | 'validated' | 'completed' | 'cancelled' | 'expired'
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
          validated_at?: string | null
          validator_address?: string | null
          validation_notes?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
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
          status?: 'available' | 'claimed' | 'in_progress' | 'submitted' | 'validated' | 'completed' | 'cancelled' | 'expired'
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
          validated_at?: string | null
          validator_address?: string | null
          validation_notes?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          metadata?: Json | null
        }
      }
      collaborators: {
        Row: {
          id: string
          wallet_address: string | null
          username: string | null
          discord_username: string | null
          github_username: string | null
          telegram_username: string | null
          bio: string | null
          avatar_url: string | null
          skills: string[] | null
          preferred_categories: string[] | null
          total_cgc_earned: number
          tasks_completed: number
          tasks_in_progress: number
          reputation_score: number
          is_active: boolean
          joined_at: string
          last_activity: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address?: string | null
          username?: string | null
          discord_username?: string | null
          github_username?: string | null
          telegram_username?: string | null
          bio?: string | null
          avatar_url?: string | null
          skills?: string[] | null
          preferred_categories?: string[] | null
          total_cgc_earned?: number
          tasks_completed?: number
          tasks_in_progress?: number
          reputation_score?: number
          is_active?: boolean
          joined_at?: string
          last_activity?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string | null
          username?: string | null
          discord_username?: string | null
          github_username?: string | null
          telegram_username?: string | null
          bio?: string | null
          avatar_url?: string | null
          skills?: string[] | null
          preferred_categories?: string[] | null
          total_cgc_earned?: number
          tasks_completed?: number
          tasks_in_progress?: number
          reputation_score?: number
          is_active?: boolean
          joined_at?: string
          last_activity?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
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
      // ============================================
      // 🤝 REFERRAL SYSTEM TABLES
      // ============================================
      referral_codes: {
        Row: {
          id: string
          wallet_address: string
          code: string
          custom_code: string | null
          is_active: boolean
          total_referrals: number
          total_earnings: number
          click_count: number
          conversion_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          code: string
          custom_code?: string | null
          is_active?: boolean
          total_referrals?: number
          total_earnings?: number
          click_count?: number
          conversion_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          code?: string
          custom_code?: string | null
          is_active?: boolean
          total_referrals?: number
          total_earnings?: number
          click_count?: number
          conversion_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_address: string
          referred_address: string
          referral_code: string
          level: 1 | 2 | 3
          status: 'pending' | 'active' | 'inactive' | 'banned'
          source: string | null
          campaign: string | null
          tasks_completed: number
          cgc_earned: number
          referrer_earnings: number
          joined_at: string
          activated_at: string | null
          last_activity: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          referrer_address: string
          referred_address: string
          referral_code: string
          level?: 1 | 2 | 3
          status?: 'pending' | 'active' | 'inactive' | 'banned'
          source?: string | null
          campaign?: string | null
          tasks_completed?: number
          cgc_earned?: number
          referrer_earnings?: number
          joined_at?: string
          activated_at?: string | null
          last_activity?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          referrer_address?: string
          referred_address?: string
          referral_code?: string
          level?: 1 | 2 | 3
          status?: 'pending' | 'active' | 'inactive' | 'banned'
          source?: string | null
          campaign?: string | null
          tasks_completed?: number
          cgc_earned?: number
          referrer_earnings?: number
          joined_at?: string
          activated_at?: string | null
          last_activity?: string | null
          metadata?: Json | null
        }
      }
      referral_rewards: {
        Row: {
          id: string
          referrer_address: string
          referred_address: string
          reward_type: 'direct_bonus' | 'level2_bonus' | 'level3_bonus' | 'milestone_5' | 'milestone_10' | 'milestone_25' | 'milestone_50' | 'milestone_100' | 'activation_bonus' | 'special_bonus'
          amount: number
          task_id: string | null
          milestone_reached: number | null
          status: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'
          tx_hash: string | null
          block_number: number | null
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          referrer_address: string
          referred_address: string
          reward_type: 'direct_bonus' | 'level2_bonus' | 'level3_bonus' | 'milestone_5' | 'milestone_10' | 'milestone_25' | 'milestone_50' | 'milestone_100' | 'activation_bonus' | 'special_bonus'
          amount: number
          task_id?: string | null
          milestone_reached?: number | null
          status?: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'
          tx_hash?: string | null
          block_number?: number | null
          paid_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          referrer_address?: string
          referred_address?: string
          reward_type?: 'direct_bonus' | 'level2_bonus' | 'level3_bonus' | 'milestone_5' | 'milestone_10' | 'milestone_25' | 'milestone_50' | 'milestone_100' | 'activation_bonus' | 'special_bonus'
          amount?: number
          task_id?: string | null
          milestone_reached?: number | null
          status?: 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'
          tx_hash?: string | null
          block_number?: number | null
          paid_at?: string | null
          created_at?: string
        }
      }
      referral_clicks: {
        Row: {
          id: string
          referral_code: string
          ip_hash: string | null
          user_agent: string | null
          source: string | null
          medium: string | null
          campaign: string | null
          referer: string | null
          landing_page: string | null
          device_type: string | null
          browser: string | null
          os: string | null
          country: string | null
          converted: boolean
          converted_address: string | null
          converted_at: string | null
          conversion_time: string | null
          city: string | null
          created_at: string
        }
        Insert: {
          id?: string
          referral_code: string
          ip_hash?: string | null
          user_agent?: string | null
          source?: string | null
          medium?: string | null
          campaign?: string | null
          referer?: string | null
          landing_page?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          country?: string | null
          city?: string | null
          converted?: boolean
          converted_address?: string | null
          converted_at?: string | null
          conversion_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          referral_code?: string
          ip_hash?: string | null
          user_agent?: string | null
          source?: string | null
          medium?: string | null
          campaign?: string | null
          referer?: string | null
          landing_page?: string | null
          device_type?: string | null
          browser?: string | null
          os?: string | null
          country?: string | null
          city?: string | null
          converted?: boolean
          converted_address?: string | null
          converted_at?: string | null
          conversion_time?: string | null
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
      referral_leaderboard: {
        Row: {
          wallet_address: string
          code: string
          custom_code: string | null
          total_referrals: number
          total_earnings: number
          level1_count: number
          level2_count: number
          level3_count: number
          earnings_rank: number
          referrals_rank: number
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

// ============================================
// 🤝 REFERRAL SYSTEM TYPES
// ============================================
export type ReferralCode = Database['public']['Tables']['referral_codes']['Row']
export type ReferralCodeInsert = Database['public']['Tables']['referral_codes']['Insert']
export type ReferralCodeUpdate = Database['public']['Tables']['referral_codes']['Update']

export type Referral = Database['public']['Tables']['referrals']['Row']
export type ReferralInsert = Database['public']['Tables']['referrals']['Insert']
export type ReferralUpdate = Database['public']['Tables']['referrals']['Update']

export type ReferralReward = Database['public']['Tables']['referral_rewards']['Row']
export type ReferralRewardInsert = Database['public']['Tables']['referral_rewards']['Insert']
export type ReferralRewardUpdate = Database['public']['Tables']['referral_rewards']['Update']

export type ReferralClick = Database['public']['Tables']['referral_clicks']['Row']
export type ReferralClickInsert = Database['public']['Tables']['referral_clicks']['Insert']
export type ReferralClickUpdate = Database['public']['Tables']['referral_clicks']['Update']

export type ReferralLevel = 1 | 2 | 3
export type ReferralStatus = 'pending' | 'active' | 'inactive' | 'banned'
export type ReferralRewardType =
  | 'direct_bonus'
  | 'level2_bonus'
  | 'level3_bonus'
  | 'milestone_5'
  | 'milestone_10'
  | 'milestone_25'
  | 'milestone_50'
  | 'milestone_100'
  | 'activation_bonus'
  | 'special_bonus'
export type ReferralRewardStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'cancelled'

// ============================================
// 👤 USER PROFILE SYSTEM TYPES
// ============================================

// Add user_profiles table to Database interface
declare module './types' {
  interface DatabaseTables {
    user_profiles: UserProfilesTable
    profile_recovery_requests: ProfileRecoveryRequestsTable
    profile_activity_log: ProfileActivityLogTable
    profile_avatars: ProfileAvatarsTable
  }
}

export interface UserProfilesTable {
  Row: {
    id: string
    wallet_address: string
    username: string | null
    display_name: string | null
    bio: string | null
    avatar_url: string | null
    email: string | null
    email_verified: boolean
    email_verification_token: string | null
    email_verification_expires_at: string | null
    password_hash: string | null
    password_reset_token: string | null
    password_reset_expires_at: string | null
    twitter_handle: string | null
    twitter_verified: boolean
    twitter_verified_at: string | null
    twitter_id: string | null
    telegram_handle: string | null
    telegram_verified: boolean
    telegram_verified_at: string | null
    telegram_id: string | null
    discord_handle: string | null
    discord_verified: boolean
    discord_verified_at: string | null
    discord_id: string | null
    website_url: string | null
    is_public: boolean
    show_email: boolean
    show_balance: boolean
    notifications_enabled: boolean
    total_tasks_completed: number
    total_cgc_earned: number
    total_referrals: number
    reputation_score: number
    last_login_at: string | null
    login_count: number
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    wallet_address: string
    username?: string | null
    display_name?: string | null
    bio?: string | null
    avatar_url?: string | null
    email?: string | null
    email_verified?: boolean
    email_verification_token?: string | null
    email_verification_expires_at?: string | null
    password_hash?: string | null
    password_reset_token?: string | null
    password_reset_expires_at?: string | null
    twitter_handle?: string | null
    twitter_verified?: boolean
    twitter_verified_at?: string | null
    twitter_id?: string | null
    telegram_handle?: string | null
    telegram_verified?: boolean
    telegram_verified_at?: string | null
    telegram_id?: string | null
    discord_handle?: string | null
    discord_verified?: boolean
    discord_verified_at?: string | null
    discord_id?: string | null
    website_url?: string | null
    is_public?: boolean
    show_email?: boolean
    show_balance?: boolean
    notifications_enabled?: boolean
    total_tasks_completed?: number
    total_cgc_earned?: number
    total_referrals?: number
    reputation_score?: number
    last_login_at?: string | null
    login_count?: number
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    wallet_address?: string
    username?: string | null
    display_name?: string | null
    bio?: string | null
    avatar_url?: string | null
    email?: string | null
    email_verified?: boolean
    email_verification_token?: string | null
    email_verification_expires_at?: string | null
    password_hash?: string | null
    password_reset_token?: string | null
    password_reset_expires_at?: string | null
    twitter_handle?: string | null
    twitter_verified?: boolean
    twitter_verified_at?: string | null
    twitter_id?: string | null
    telegram_handle?: string | null
    telegram_verified?: boolean
    telegram_verified_at?: string | null
    telegram_id?: string | null
    discord_handle?: string | null
    discord_verified?: boolean
    discord_verified_at?: string | null
    discord_id?: string | null
    website_url?: string | null
    is_public?: boolean
    show_email?: boolean
    show_balance?: boolean
    notifications_enabled?: boolean
    total_tasks_completed?: number
    total_cgc_earned?: number
    total_referrals?: number
    reputation_score?: number
    last_login_at?: string | null
    login_count?: number
    created_at?: string
    updated_at?: string
  }
}

export interface ProfileRecoveryRequestsTable {
  Row: {
    id: string
    user_id: string
    recovery_type: ProfileRecoveryType
    token: string
    status: ProfileRecoveryStatus
    new_wallet_address: string | null
    old_wallet_address: string | null
    ip_address: string | null
    user_agent: string | null
    expires_at: string
    completed_at: string | null
    created_at: string
  }
  Insert: {
    id?: string
    user_id: string
    recovery_type: ProfileRecoveryType
    token: string
    status?: ProfileRecoveryStatus
    new_wallet_address?: string | null
    old_wallet_address?: string | null
    ip_address?: string | null
    user_agent?: string | null
    expires_at: string
    completed_at?: string | null
    created_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    recovery_type?: ProfileRecoveryType
    token?: string
    status?: ProfileRecoveryStatus
    new_wallet_address?: string | null
    old_wallet_address?: string | null
    ip_address?: string | null
    user_agent?: string | null
    expires_at?: string
    completed_at?: string | null
    created_at?: string
  }
}

export interface ProfileActivityLogTable {
  Row: {
    id: string
    user_id: string
    action: string
    description: string | null
    ip_address: string | null
    user_agent: string | null
    metadata: Json
    created_at: string
  }
  Insert: {
    id?: string
    user_id: string
    action: string
    description?: string | null
    ip_address?: string | null
    user_agent?: string | null
    metadata?: Json
    created_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    action?: string
    description?: string | null
    ip_address?: string | null
    user_agent?: string | null
    metadata?: Json
    created_at?: string
  }
}

export interface ProfileAvatarsTable {
  Row: {
    id: string
    user_id: string
    file_name: string
    file_size: number
    mime_type: string
    storage_path: string
    public_url: string
    is_active: boolean
    created_at: string
  }
  Insert: {
    id?: string
    user_id: string
    file_name: string
    file_size: number
    mime_type: string
    storage_path: string
    public_url: string
    is_active?: boolean
    created_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    file_name?: string
    file_size?: number
    mime_type?: string
    storage_path?: string
    public_url?: string
    is_active?: boolean
    created_at?: string
  }
}

// Helper types for user profiles
export type UserProfile = UserProfilesTable['Row']
export type UserProfileInsert = UserProfilesTable['Insert']
export type UserProfileUpdate = UserProfilesTable['Update']

export type ProfileRecoveryRequest = ProfileRecoveryRequestsTable['Row']
export type ProfileRecoveryRequestInsert = ProfileRecoveryRequestsTable['Insert']
export type ProfileRecoveryRequestUpdate = ProfileRecoveryRequestsTable['Update']

export type ProfileActivityLog = ProfileActivityLogTable['Row']
export type ProfileActivityLogInsert = ProfileActivityLogTable['Insert']

export type ProfileAvatar = ProfileAvatarsTable['Row']
export type ProfileAvatarInsert = ProfileAvatarsTable['Insert']

// Enums for profiles
export type ProfileRecoveryType = 'email_verify' | 'password_reset' | 'wallet_change'
export type ProfileRecoveryStatus = 'pending' | 'completed' | 'expired' | 'cancelled'

// Profile tier based on reputation
export type ProfileTier = 'Starter' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'

// Public profile view type (for display)
export interface PublicProfile {
  id: string
  wallet_address: string
  username: string | null
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  twitter_handle: string | null
  telegram_handle: string | null
  discord_handle: string | null
  website_url: string | null
  total_tasks_completed: number
  total_cgc_earned: number
  total_referrals: number
  reputation_score: number
  tier: ProfileTier
  tier_color: string
  created_at: string
}

// Profile settings type
export interface ProfileSettings {
  is_public: boolean
  show_email: boolean
  show_balance: boolean
  notifications_enabled: boolean
}

// Profile update request type (for API)
export interface ProfileUpdateRequest {
  username?: string
  display_name?: string
  bio?: string
  twitter_handle?: string
  telegram_handle?: string
  discord_handle?: string
  website_url?: string
  settings?: Partial<ProfileSettings>
}

// Recovery setup request type
export interface RecoverySetupRequest {
  email: string
  password: string
}

// Password reset request type
export interface PasswordResetRequest {
  token: string
  new_password: string
}

// ============================================
// 🎯 SOCIAL ENGAGEMENT REWARDS TYPES
// ============================================

export type SocialEngagementPlatform = 'twitter' | 'discord'
export type SocialEngagementAction = 'follow' | 'join'
export type SocialEngagementStatus = 'pending' | 'claimed' | 'verified' | 'rejected'

export interface SocialEngagementRewardsTable {
  Row: {
    id: string
    wallet_address: string
    platform: SocialEngagementPlatform
    action: SocialEngagementAction
    reward_amount: number
    status: SocialEngagementStatus
    platform_user_id: string | null
    platform_username: string | null
    clicked_at: string | null
    claimed_at: string | null
    verified_at: string | null
    tx_hash: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    wallet_address: string
    platform: SocialEngagementPlatform
    action: SocialEngagementAction
    reward_amount?: number
    status?: SocialEngagementStatus
    platform_user_id?: string | null
    platform_username?: string | null
    clicked_at?: string | null
    claimed_at?: string | null
    verified_at?: string | null
    tx_hash?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    wallet_address?: string
    platform?: SocialEngagementPlatform
    action?: SocialEngagementAction
    reward_amount?: number
    status?: SocialEngagementStatus
    platform_user_id?: string | null
    platform_username?: string | null
    clicked_at?: string | null
    claimed_at?: string | null
    verified_at?: string | null
    tx_hash?: string | null
    created_at?: string
    updated_at?: string
  }
}

export type SocialEngagementReward = SocialEngagementRewardsTable['Row']
export type SocialEngagementRewardInsert = SocialEngagementRewardsTable['Insert']
export type SocialEngagementRewardUpdate = SocialEngagementRewardsTable['Update']

// Social engagement configuration
export const SOCIAL_ENGAGEMENT_CONFIG = {
  twitter: {
    followUrl: 'https://twitter.com/intent/follow?screen_name=CryptoGiftDAO',
    rewardAmount: 100, // CGC
    action: 'follow' as SocialEngagementAction,
  },
  discord: {
    joinUrl: 'https://discord.gg/cryptogiftdao', // Replace with actual invite code
    rewardAmount: 100, // CGC
    action: 'join' as SocialEngagementAction,
  },
} as const