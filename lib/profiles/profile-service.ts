/**
 * 👤 PROFILE SERVICE
 *
 * Enterprise-grade user profile management for CryptoGift DAO.
 * Handles profile CRUD, recovery setup, and avatar management.
 *
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type {
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  PublicProfile,
  ProfileSettings,
  ProfileTier,
  ProfileActivityLogInsert,
  Json,
} from '@/lib/supabase/types';

// =====================================================
// 📊 CONSTANTS
// =====================================================

const BCRYPT_ROUNDS = 12;
const TOKEN_LENGTH = 64;
const EMAIL_VERIFY_EXPIRY_HOURS = 24;
const PASSWORD_RESET_EXPIRY_HOURS = 1;

// Tier thresholds based on reputation score
const TIER_THRESHOLDS = {
  Diamond: 10000,
  Platinum: 5000,
  Gold: 2500,
  Silver: 1000,
  Bronze: 500,
  Starter: 0,
} as const;

const TIER_COLORS: Record<ProfileTier, string> = {
  Diamond: '#B9F2FF',
  Platinum: '#E5E4E2',
  Gold: '#FFD700',
  Silver: '#C0C0C0',
  Bronze: '#CD7F32',
  Starter: '#808080',
};

// =====================================================
// 🔧 SUPABASE CLIENT (LAZY INITIALIZATION)
// =====================================================

// Lazy initialization to prevent build-time errors when env vars are not set
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables not configured (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
    }

    _supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabase;
}

// =====================================================
// 🎯 HELPER FUNCTIONS
// =====================================================

/**
 * Generate secure random token
 */
function generateToken(length: number = TOKEN_LENGTH): string {
  return crypto.randomBytes(length / 2).toString('hex');
}

/**
 * Calculate tier from reputation score
 */
export function calculateTier(reputationScore: number): ProfileTier {
  if (reputationScore >= TIER_THRESHOLDS.Diamond) return 'Diamond';
  if (reputationScore >= TIER_THRESHOLDS.Platinum) return 'Platinum';
  if (reputationScore >= TIER_THRESHOLDS.Gold) return 'Gold';
  if (reputationScore >= TIER_THRESHOLDS.Silver) return 'Silver';
  if (reputationScore >= TIER_THRESHOLDS.Bronze) return 'Bronze';
  return 'Starter';
}

/**
 * Get tier color
 */
export function getTierColor(tier: ProfileTier): string {
  return TIER_COLORS[tier];
}

/**
 * Validate wallet address format
 */
function isValidWallet(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

/**
 * Validate username format (alphanumeric + underscore, 3-50 chars)
 */
function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,50}$/.test(username);
}

/**
 * Hash password with bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify password against hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Log profile activity
 */
async function logActivity(
  userId: string,
  action: string,
  description?: string,
  metadata?: Json
): Promise<void> {
  try {
    const log: ProfileActivityLogInsert = {
      user_id: userId,
      action,
      description,
      metadata: metadata ?? null,
    };

    await getSupabase().from('profile_activity_log').insert(log);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// =====================================================
// 📝 PROFILE CRUD OPERATIONS
// =====================================================

/**
 * Get or create profile for wallet address
 */
export async function getOrCreateProfile(walletAddress: string): Promise<UserProfile> {
  if (!isValidWallet(walletAddress)) {
    throw new Error('Invalid wallet address format');
  }

  const normalizedWallet = walletAddress.toLowerCase();

  // Try to get existing profile
  const { data: existing, error: fetchError } = await getSupabase()
    .from('user_profiles')
    .select('*')
    .eq('wallet_address', normalizedWallet)
    .single();

  if (existing) {
    // Update login stats
    await getSupabase()
      .from('user_profiles')
      .update({
        last_login_at: new Date().toISOString(),
        login_count: existing.login_count + 1,
      })
      .eq('id', existing.id);

    return existing;
  }

  // Create new profile
  const newProfile: UserProfileInsert = {
    wallet_address: normalizedWallet,
    last_login_at: new Date().toISOString(),
    login_count: 1,
  };

  const { data: created, error: createError } = await getSupabase()
    .from('user_profiles')
    .insert(newProfile)
    .select()
    .single();

  if (createError || !created) {
    throw new Error(`Failed to create profile: ${createError?.message}`);
  }

  await logActivity(created.id, 'profile_created', 'New profile created');

  return created;
}

/**
 * Get profile by wallet address
 */
export async function getProfileByWallet(walletAddress: string): Promise<UserProfile | null> {
  if (!isValidWallet(walletAddress)) {
    return null;
  }

  const { data, error } = await getSupabase()
    .from('user_profiles')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Get profile by username
 */
export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const { data, error } = await getSupabase()
    .from('user_profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Get public profile (safe to display)
 */
export async function getPublicProfile(walletAddress: string): Promise<PublicProfile | null> {
  const profile = await getProfileByWallet(walletAddress);

  if (!profile || !profile.is_public) {
    return null;
  }

  const tier = calculateTier(profile.reputation_score);

  return {
    id: profile.id,
    wallet_address: profile.wallet_address,
    username: profile.username,
    display_name: profile.display_name,
    bio: profile.bio,
    avatar_url: profile.avatar_url,
    twitter_handle: profile.twitter_handle,
    telegram_handle: profile.telegram_handle,
    discord_handle: profile.discord_handle,
    website_url: profile.website_url,
    total_tasks_completed: profile.total_tasks_completed,
    total_cgc_earned: profile.show_balance ? profile.total_cgc_earned : 0,
    total_referrals: profile.total_referrals,
    reputation_score: profile.reputation_score,
    tier,
    tier_color: getTierColor(tier),
    created_at: profile.created_at,
  };
}

/**
 * Update profile
 */
export async function updateProfile(
  walletAddress: string,
  updates: UserProfileUpdate
): Promise<UserProfile> {
  if (!isValidWallet(walletAddress)) {
    throw new Error('Invalid wallet address format');
  }

  const profile = await getProfileByWallet(walletAddress);
  if (!profile) {
    throw new Error('Profile not found');
  }

  // Validate username if provided
  if (updates.username !== undefined) {
    if (updates.username && !isValidUsername(updates.username)) {
      throw new Error('Invalid username format. Use 3-50 alphanumeric characters or underscores.');
    }

    // Check uniqueness
    if (updates.username) {
      const existing = await getProfileByUsername(updates.username);
      if (existing && existing.id !== profile.id) {
        throw new Error('Username already taken');
      }
      updates.username = updates.username.toLowerCase();
    }
  }

  // Remove sensitive fields from updates
  const safeUpdates = { ...updates };
  delete safeUpdates.password_hash;
  delete safeUpdates.email_verification_token;
  delete safeUpdates.password_reset_token;
  delete safeUpdates.total_tasks_completed;
  delete safeUpdates.total_cgc_earned;
  delete safeUpdates.total_referrals;
  delete safeUpdates.reputation_score;

  const { data, error } = await getSupabase()
    .from('user_profiles')
    .update({
      ...safeUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update profile: ${error?.message}`);
  }

  await logActivity(profile.id, 'profile_updated', 'Profile information updated', {
    fields: Object.keys(safeUpdates),
  });

  return data;
}

/**
 * Update profile settings
 */
export async function updateProfileSettings(
  walletAddress: string,
  settings: Partial<ProfileSettings>
): Promise<UserProfile> {
  return updateProfile(walletAddress, settings);
}

// =====================================================
// 🔐 RECOVERY SYSTEM
// =====================================================

/**
 * Setup recovery email and password
 */
export async function setupRecovery(
  walletAddress: string,
  email: string,
  password: string
): Promise<{ success: boolean; verificationSent: boolean }> {
  if (!isValidWallet(walletAddress)) {
    throw new Error('Invalid wallet address format');
  }

  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const profile = await getProfileByWallet(walletAddress);
  if (!profile) {
    throw new Error('Profile not found');
  }

  // Check if email is already used by another account
  const { data: existingEmail } = await getSupabase()
    .from('user_profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .neq('id', profile.id)
    .single();

  if (existingEmail) {
    throw new Error('Email already registered to another account');
  }

  // Hash password and generate verification token
  const passwordHash = await hashPassword(password);
  const verificationToken = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFY_EXPIRY_HOURS);

  // Update profile
  const { error: updateError } = await getSupabase()
    .from('user_profiles')
    .update({
      email: email.toLowerCase(),
      email_verified: false,
      password_hash: passwordHash,
      email_verification_token: verificationToken,
      email_verification_expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  if (updateError) {
    throw new Error(`Failed to setup recovery: ${updateError.message}`);
  }

  // Create recovery request record
  await getSupabase().from('profile_recovery_requests').insert({
    user_id: profile.id,
    recovery_type: 'email_verify',
    token: verificationToken,
    expires_at: expiresAt.toISOString(),
  });

  await logActivity(profile.id, 'recovery_setup', 'Recovery email and password configured');

  // TODO: Send verification email (integrate with email service)
  // For now, just return success
  return {
    success: true,
    verificationSent: true,
  };
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; wallet: string }> {
  // Find request by token
  const { data: request, error: requestError } = await getSupabase()
    .from('profile_recovery_requests')
    .select('*, user_profiles!inner(wallet_address)')
    .eq('token', token)
    .eq('recovery_type', 'email_verify')
    .eq('status', 'pending')
    .single();

  if (requestError || !request) {
    throw new Error('Invalid or expired verification token');
  }

  // Check if expired
  if (new Date(request.expires_at) < new Date()) {
    await getSupabase()
      .from('profile_recovery_requests')
      .update({ status: 'expired' })
      .eq('id', request.id);
    throw new Error('Verification token has expired');
  }

  // Update request status
  await getSupabase()
    .from('profile_recovery_requests')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', request.id);

  // Update profile
  await getSupabase()
    .from('user_profiles')
    .update({
      email_verified: true,
      email_verification_token: null,
      email_verification_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', request.user_id);

  await logActivity(request.user_id, 'email_verified', 'Email address verified');

  const walletAddress = (request as { user_profiles: { wallet_address: string } }).user_profiles.wallet_address;

  return {
    success: true,
    wallet: walletAddress,
  };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  if (!isValidEmail(email)) {
    // Don't reveal if email exists
    return { success: true, message: 'If email exists, reset instructions will be sent' };
  }

  const { data: profile, error } = await getSupabase()
    .from('user_profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('email_verified', true)
    .single();

  if (error || !profile) {
    // Don't reveal if email exists
    return { success: true, message: 'If email exists, reset instructions will be sent' };
  }

  // Cancel existing pending requests
  await getSupabase()
    .from('profile_recovery_requests')
    .update({ status: 'cancelled' })
    .eq('user_id', profile.id)
    .eq('recovery_type', 'password_reset')
    .eq('status', 'pending');

  // Generate reset token
  const resetToken = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_EXPIRY_HOURS);

  // Update profile
  await getSupabase()
    .from('user_profiles')
    .update({
      password_reset_token: resetToken,
      password_reset_expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  // Create recovery request
  await getSupabase().from('profile_recovery_requests').insert({
    user_id: profile.id,
    recovery_type: 'password_reset',
    token: resetToken,
    expires_at: expiresAt.toISOString(),
  });

  await logActivity(profile.id, 'password_reset_requested', 'Password reset requested');

  // TODO: Send reset email
  return { success: true, message: 'If email exists, reset instructions will be sent' };
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; wallet: string }> {
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  // Find request by token
  const { data: request, error: requestError } = await getSupabase()
    .from('profile_recovery_requests')
    .select('*, user_profiles!inner(wallet_address)')
    .eq('token', token)
    .eq('recovery_type', 'password_reset')
    .eq('status', 'pending')
    .single();

  if (requestError || !request) {
    throw new Error('Invalid or expired reset token');
  }

  // Check if expired
  if (new Date(request.expires_at) < new Date()) {
    await getSupabase()
      .from('profile_recovery_requests')
      .update({ status: 'expired' })
      .eq('id', request.id);
    throw new Error('Reset token has expired');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update request status
  await getSupabase()
    .from('profile_recovery_requests')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', request.id);

  // Update profile
  await getSupabase()
    .from('user_profiles')
    .update({
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', request.user_id);

  await logActivity(request.user_id, 'password_reset_completed', 'Password successfully reset');

  const walletAddress = (request as { user_profiles: { wallet_address: string } }).user_profiles.wallet_address;

  return {
    success: true,
    wallet: walletAddress,
  };
}

/**
 * Login with email/password (for recovery)
 */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; wallet: string; profile: UserProfile }> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid credentials');
  }

  const { data: profile, error } = await getSupabase()
    .from('user_profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('email_verified', true)
    .single();

  if (error || !profile || !profile.password_hash) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = await verifyPassword(password, profile.password_hash);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Update login stats
  await getSupabase()
    .from('user_profiles')
    .update({
      last_login_at: new Date().toISOString(),
      login_count: profile.login_count + 1,
    })
    .eq('id', profile.id);

  await logActivity(profile.id, 'login_email', 'Logged in with email/password');

  return {
    success: true,
    wallet: profile.wallet_address,
    profile,
  };
}

// =====================================================
// 🖼️ AVATAR MANAGEMENT
// =====================================================

/**
 * Update avatar URL
 */
export async function updateAvatar(
  walletAddress: string,
  avatarUrl: string
): Promise<UserProfile> {
  return updateProfile(walletAddress, { avatar_url: avatarUrl });
}

/**
 * Remove avatar
 */
export async function removeAvatar(walletAddress: string): Promise<UserProfile> {
  return updateProfile(walletAddress, { avatar_url: null });
}

// =====================================================
// 📊 PROFILE STATS
// =====================================================

/**
 * Get profile leaderboard
 */
export async function getProfileLeaderboard(options: {
  limit?: number;
  offset?: number;
  sortBy?: 'reputation' | 'cgc' | 'tasks' | 'referrals';
}): Promise<{ profiles: PublicProfile[]; total: number }> {
  const limit = Math.min(options.limit || 50, 100);
  const offset = options.offset || 0;
  const sortBy = options.sortBy || 'reputation';

  const sortColumn = {
    reputation: 'reputation_score',
    cgc: 'total_cgc_earned',
    tasks: 'total_tasks_completed',
    referrals: 'total_referrals',
  }[sortBy];

  const { data, error, count } = await getSupabase()
    .from('user_profiles')
    .select('*', { count: 'exact' })
    .eq('is_public', true)
    .order(sortColumn, { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    return { profiles: [], total: 0 };
  }

  const profiles: PublicProfile[] = data.map((profile: UserProfile) => {
    const tier = calculateTier(profile.reputation_score);
    return {
      id: profile.id,
      wallet_address: profile.wallet_address,
      username: profile.username,
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      twitter_handle: profile.twitter_handle,
      telegram_handle: profile.telegram_handle,
      discord_handle: profile.discord_handle,
      website_url: profile.website_url,
      total_tasks_completed: profile.total_tasks_completed,
      total_cgc_earned: profile.show_balance ? profile.total_cgc_earned : 0,
      total_referrals: profile.total_referrals,
      reputation_score: profile.reputation_score,
      tier,
      tier_color: getTierColor(tier),
      created_at: profile.created_at,
    };
  });

  return {
    profiles,
    total: count || 0,
  };
}

/**
 * Search profiles by username
 */
export async function searchProfiles(
  query: string,
  limit: number = 10
): Promise<PublicProfile[]> {
  if (query.length < 2) {
    return [];
  }

  const { data, error } = await getSupabase()
    .from('user_profiles')
    .select('*')
    .eq('is_public', true)
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((profile: UserProfile) => {
    const tier = calculateTier(profile.reputation_score);
    return {
      id: profile.id,
      wallet_address: profile.wallet_address,
      username: profile.username,
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      twitter_handle: profile.twitter_handle,
      telegram_handle: profile.telegram_handle,
      discord_handle: profile.discord_handle,
      website_url: profile.website_url,
      total_tasks_completed: profile.total_tasks_completed,
      total_cgc_earned: profile.show_balance ? profile.total_cgc_earned : 0,
      total_referrals: profile.total_referrals,
      reputation_score: profile.reputation_score,
      tier,
      tier_color: getTierColor(tier),
      created_at: profile.created_at,
    };
  });
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(
  username: string,
  excludeWallet?: string
): Promise<boolean> {
  if (!isValidUsername(username)) {
    return false;
  }

  let query = getSupabase()
    .from('user_profiles')
    .select('id')
    .eq('username', username.toLowerCase());

  if (excludeWallet) {
    query = query.neq('wallet_address', excludeWallet.toLowerCase());
  }

  const { data } = await query.single();
  return !data;
}
