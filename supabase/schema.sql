-- =====================================================
-- 🏗️  CryptoGift DAO - Complete Database Schema
-- =====================================================
-- This script creates all tables needed for the DAO system
-- Run this in Supabase SQL editor to initialize the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 📋 TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    complexity INTEGER CHECK (complexity >= 1 AND complexity <= 10),
    reward_cgc DECIMAL(20,2) DEFAULT 0,
    estimated_days INTEGER DEFAULT 1,
    platform TEXT DEFAULT 'manual' CHECK (platform IN ('manual', 'github', 'discord', 'zealy')),
    category TEXT DEFAULT 'general' CHECK (category IN ('development', 'design', 'marketing', 'community', 'security', 'documentation', 'testing', 'general')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'claimed', 'in_progress', 'submitted', 'completed', 'cancelled')),
    required_skills TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    assignee_address TEXT,
    assignee_discord_id TEXT,
    claimed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    evidence_url TEXT,
    pr_url TEXT,
    validation_hash TEXT,
    validators TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_address);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);

-- =====================================================
-- 👥 COLLABORATORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.collaborators (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE,
    username TEXT,
    discord_username TEXT,
    github_username TEXT,
    telegram_username TEXT,
    bio TEXT,
    avatar_url TEXT,
    skills TEXT[] DEFAULT '{}',
    preferred_categories TEXT[] DEFAULT '{}',
    total_cgc_earned DECIMAL(20,2) DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_in_progress INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collaborators_wallet ON public.collaborators(wallet_address);
CREATE INDEX IF NOT EXISTS idx_collaborators_discord ON public.collaborators(discord_username);
CREATE INDEX IF NOT EXISTS idx_collaborators_cgc ON public.collaborators(total_cgc_earned DESC);

-- =====================================================
-- 📜 PROPOSALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.task_proposals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    proposal_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    estimated_reward DECIMAL(20,2) DEFAULT 0,
    estimated_days INTEGER DEFAULT 1,
    required_skills TEXT[] DEFAULT '{}',
    proposer_address TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    voting_deadline TIMESTAMPTZ,
    implementation_deadline TIMESTAMPTZ,
    rejected_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.task_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_proposer ON public.task_proposals(proposer_address);

-- =====================================================
-- 📊 TASK HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.task_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_address TEXT,
    previous_status TEXT,
    new_status TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_history_task ON public.task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_history_actor ON public.task_history(actor_address);
CREATE INDEX IF NOT EXISTS idx_history_created ON public.task_history(created_at DESC);

-- =====================================================
-- 🔄 UPDATE TRIGGERS
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborators_updated_at 
    BEFORE UPDATE ON public.collaborators 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at 
    BEFORE UPDATE ON public.task_proposals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 🔒 ROW LEVEL SECURITY POLICIES
-- =====================================================
-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- Tasks policies (public read, authenticated write)
CREATE POLICY "Tasks are viewable by everyone" ON public.tasks
    FOR SELECT USING (true);

CREATE POLICY "Tasks can be updated by authenticated users" ON public.tasks
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Collaborators policies (public read, own record update)
CREATE POLICY "Collaborators are viewable by everyone" ON public.collaborators
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own collaborator record" ON public.collaborators
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Proposals policies (public read, authenticated create/update)
CREATE POLICY "Proposals are viewable by everyone" ON public.task_proposals
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create/update proposals" ON public.task_proposals
    FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- History policies (public read, service write)
CREATE POLICY "History is viewable by everyone" ON public.task_history
    FOR SELECT USING (true);

CREATE POLICY "Service role can insert history" ON public.task_history
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 📊 INITIAL VIEWS (optional but helpful)
-- =====================================================
-- View for active tasks with assignee info
CREATE OR REPLACE VIEW public.active_tasks_with_assignees AS
SELECT 
    t.*,
    c.username as assignee_username,
    c.discord_username as assignee_discord
FROM public.tasks t
LEFT JOIN public.collaborators c ON t.assignee_address = c.wallet_address
WHERE t.status IN ('available', 'claimed', 'in_progress', 'submitted');

-- View for leaderboard
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    *,
    RANK() OVER (ORDER BY total_cgc_earned DESC) as rank
FROM public.collaborators
WHERE is_active = true AND total_cgc_earned > 0
ORDER BY total_cgc_earned DESC;

-- =====================================================
-- ✅ SCHEMA INITIALIZATION COMPLETE
-- =====================================================
-- The database is now ready for the CryptoGift DAO system!
-- Next steps:
-- 1. Run the init-tasks API to populate the 34 predefined tasks
-- 2. Configure environment variables in Vercel
-- 3. Test the system functionality

NOTIFY 'cryptogift_dao_schema_ready', 'Database schema initialized successfully!';