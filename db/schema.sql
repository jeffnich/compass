-- Ion Slack Bot Database Schema
-- PostgreSQL 17 with pgvector extension

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Messages table: stores all Slack messages for context
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  
  -- Slack identifiers
  ts TEXT NOT NULL UNIQUE,          -- Slack message timestamp (unique ID)
  channel_id TEXT NOT NULL,         -- Channel where message was posted
  thread_ts TEXT,                   -- Thread timestamp (if in thread)
  user_id TEXT NOT NULL,            -- User who posted
  
  -- Content
  text TEXT NOT NULL,               -- Message text
  embedding vector(1536),           -- OpenAI embedding for semantic search
  
  -- Metadata
  message_type TEXT DEFAULT 'message', -- message, file_share, etc.
  subtype TEXT,                     -- Optional subtype
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  slack_created_at TIMESTAMP NOT NULL
);

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_ts);
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(slack_created_at DESC);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_embedding ON messages 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Channels table: track which channels Ion is in
CREATE TABLE IF NOT EXISTS channels (
  id SERIAL PRIMARY KEY,
  channel_id TEXT NOT NULL UNIQUE,
  channel_name TEXT,
  is_private BOOLEAN DEFAULT false,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_indexed_ts TEXT             -- Last message timestamp we indexed
);

CREATE INDEX IF NOT EXISTS idx_channels_channel_id ON channels(channel_id);

-- Users table: cache user info
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  real_name TEXT,
  display_name TEXT,
  email TEXT,
  is_bot BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- Command usage tracking
CREATE TABLE IF NOT EXISTS command_usage (
  id SERIAL PRIMARY KEY,
  command_name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  input_text TEXT,
  response_length INT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  execution_time_ms INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_command_usage_command ON command_usage(command_name);
CREATE INDEX IF NOT EXISTS idx_command_usage_user ON command_usage(user_id, command_name);
CREATE INDEX IF NOT EXISTS idx_command_usage_created ON command_usage(created_at DESC);

-- Function: Search messages by semantic similarity
CREATE OR REPLACE FUNCTION search_messages(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  channel_filter text DEFAULT NULL
)
RETURNS TABLE (
  ts text,
  channel_id text,
  user_id text,
  text text,
  slack_created_at timestamp,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.ts,
    m.channel_id,
    m.user_id,
    m.text,
    m.slack_created_at,
    1 - (m.embedding <=> query_embedding) as similarity
  FROM messages m
  WHERE 
    (channel_filter IS NULL OR m.channel_id = channel_filter)
    AND m.embedding IS NOT NULL
    AND (1 - (m.embedding <=> query_embedding)) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function: Get recent messages from channel/thread
CREATE OR REPLACE FUNCTION get_recent_messages(
  p_channel_id text,
  p_thread_ts text DEFAULT NULL,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  ts text,
  user_id text,
  text text,
  slack_created_at timestamp
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.ts,
    m.user_id,
    m.text,
    m.slack_created_at
  FROM messages m
  WHERE 
    m.channel_id = p_channel_id
    AND (p_thread_ts IS NULL OR m.thread_ts = p_thread_ts)
  ORDER BY m.slack_created_at DESC
  LIMIT p_limit;
END;
$$;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_messages_channel_created 
  ON messages(channel_id, slack_created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_thread_created 
  ON messages(thread_ts, slack_created_at DESC) 
  WHERE thread_ts IS NOT NULL;

-- ========================================
-- WORKSPACE INSIGHTS
-- ========================================

-- Workspace insights table: AI-extracted decisions, questions, topics
CREATE TABLE IF NOT EXISTS workspace_insights (
  id SERIAL PRIMARY KEY,
  insight_type TEXT NOT NULL,       -- 'decision', 'question', 'topic'
  content TEXT NOT NULL,            -- Raw extracted content
  summary TEXT,                     -- AI-generated summary
  channel_id TEXT,                  -- Where it came from
  thread_ts TEXT,                   -- Thread reference
  mentioned_users TEXT[],           -- User IDs involved
  confidence FLOAT,                 -- 0-1 confidence score
  status TEXT,                      -- 'implemented', 'pending', 'abandoned', 'open', 'answered'
  reply_count INT DEFAULT 0,        -- Number of replies (for questions)
  metadata JSONB,                   -- Flexible metadata storage
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for workspace_insights
CREATE INDEX IF NOT EXISTS idx_insights_type ON workspace_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_created ON workspace_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_channel ON workspace_insights(channel_id);
CREATE INDEX IF NOT EXISTS idx_insights_status ON workspace_insights(status);
CREATE INDEX IF NOT EXISTS idx_insights_type_created ON workspace_insights(insight_type, created_at DESC);

-- Topic trends table: tracks topic mentions over time
CREATE TABLE IF NOT EXISTS topic_trends (
  id SERIAL PRIMARY KEY,
  topic_name TEXT NOT NULL,
  period_start TIMESTAMP NOT NULL,  -- Start of time window (e.g., day)
  period_end TIMESTAMP NOT NULL,    -- End of time window
  message_count INT DEFAULT 0,
  channel_ids TEXT[],               -- Channels discussing this topic
  user_ids TEXT[],                  -- Users discussing this topic
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topic_trends_topic ON topic_trends(topic_name);
CREATE INDEX IF NOT EXISTS idx_topic_trends_period ON topic_trends(period_start DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_topic_trends_unique 
  ON topic_trends(topic_name, period_start);

-- Insight suggestions table: AI-generated "Ask me about..." suggestions
CREATE TABLE IF NOT EXISTS insight_suggestions (
  id SERIAL PRIMARY KEY,
  suggestion_text TEXT NOT NULL,
  based_on_insights INT[],          -- IDs of insights this is based on
  relevance_score FLOAT,            -- How relevant/useful this suggestion is
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP              -- When this suggestion becomes stale
);

CREATE INDEX IF NOT EXISTS idx_suggestions_created ON insight_suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_expires ON insight_suggestions(expires_at);

-- Function: Get insights by type and date range
CREATE OR REPLACE FUNCTION get_insights_by_type(
  p_insight_type text,
  p_days_back int DEFAULT 7,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  id int,
  summary text,
  channel_id text,
  thread_ts text,
  mentioned_users text[],
  confidence float,
  status text,
  created_at timestamp,
  metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.summary,
    i.channel_id,
    i.thread_ts,
    i.mentioned_users,
    i.confidence,
    i.status,
    i.created_at,
    i.metadata
  FROM workspace_insights i
  WHERE 
    i.insight_type = p_insight_type
    AND i.created_at >= NOW() - (p_days_back || ' days')::INTERVAL
  ORDER BY i.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function: Get trending topics
CREATE OR REPLACE FUNCTION get_trending_topics(
  p_days_back int DEFAULT 7,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  topic_name text,
  current_count bigint,
  previous_count bigint,
  trend_direction text,
  top_channels text[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      tt.topic_name,
      SUM(tt.message_count) as msg_count,
      array_agg(DISTINCT unnest(tt.channel_ids)) as channels
    FROM topic_trends tt
    WHERE tt.period_start >= NOW() - (p_days_back || ' days')::INTERVAL
    GROUP BY tt.topic_name
  ),
  previous_period AS (
    SELECT 
      tt.topic_name,
      SUM(tt.message_count) as msg_count
    FROM topic_trends tt
    WHERE 
      tt.period_start >= NOW() - (p_days_back * 2 || ' days')::INTERVAL
      AND tt.period_start < NOW() - (p_days_back || ' days')::INTERVAL
    GROUP BY tt.topic_name
  )
  SELECT 
    cp.topic_name,
    cp.msg_count as current_count,
    COALESCE(pp.msg_count, 0) as previous_count,
    CASE 
      WHEN COALESCE(pp.msg_count, 0) = 0 THEN 'new'
      WHEN cp.msg_count > pp.msg_count THEN 'up'
      WHEN cp.msg_count < pp.msg_count THEN 'down'
      ELSE 'stable'
    END as trend_direction,
    cp.channels as top_channels
  FROM current_period cp
  LEFT JOIN previous_period pp ON cp.topic_name = pp.topic_name
  ORDER BY cp.msg_count DESC
  LIMIT p_limit;
END;
$$;
