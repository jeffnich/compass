-- Seed test data for Ion Slack bot
-- This creates realistic conversations for testing MCP and search

-- Clear existing test data (optional)
-- DELETE FROM messages WHERE channel_id LIKE 'TEST_%';

-- Insert test messages across different channels

-- #product channel - Product discussions
INSERT INTO messages (ts, channel_id, thread_ts, user_id, text, slack_created_at)
VALUES
  ('1708617600.000100', 'TEST_PRODUCT', NULL, 'U001', 'We need to decide on a database for the new project', '2024-02-22 10:00:00'),
  ('1708617660.000200', 'TEST_PRODUCT', NULL, 'U002', 'I think we should go with PostgreSQL. Better for our use case with complex queries', '2024-02-22 10:01:00'),
  ('1708617720.000300', 'TEST_PRODUCT', NULL, 'U003', 'Agreed! PostgreSQL has better support for JSON and full-text search', '2024-02-22 10:02:00'),
  ('1708617780.000400', 'TEST_PRODUCT', NULL, 'U001', 'Sounds good. Let''s go with PostgreSQL then. @U002 can you set up the initial schema?', '2024-02-22 10:03:00'),
  ('1708617840.000500', 'TEST_PRODUCT', NULL, 'U002', 'Will do! I''ll have the schema ready by end of day', '2024-02-22 10:04:00'),
  
  ('1708704000.000600', 'TEST_PRODUCT', NULL, 'U001', 'What features are we prioritizing for Q2?', '2024-02-23 10:00:00'),
  ('1708704060.000700', 'TEST_PRODUCT', NULL, 'U003', 'Top 3 should be: user profiles, OAuth integration, and mobile app redesign', '2024-02-23 10:01:00'),
  ('1708704120.000800', 'TEST_PRODUCT', NULL, 'U002', 'User profiles is critical. We''ve had tons of requests for that', '2024-02-23 10:02:00'),
  ('1708704180.000900', 'TEST_PRODUCT', NULL, 'U001', 'Decided: Q2 priorities are user profiles, OAuth, and mobile redesign in that order', '2024-02-23 10:03:00'),
  
  ('1708790400.001000', 'TEST_PRODUCT', NULL, 'U003', 'Should we use REST or GraphQL for the new API?', '2024-02-24 10:00:00'),
  ('1708790460.001100', 'TEST_PRODUCT', NULL, 'U002', 'GraphQL gives us more flexibility, but REST is simpler', '2024-02-24 10:01:00'),
  ('1708790520.001200', 'TEST_PRODUCT', NULL, 'U001', 'Let''s go with REST for v1. We can add GraphQL later if needed', '2024-02-24 10:02:00'),
  ('1708790580.001300', 'TEST_PRODUCT', NULL, 'U003', 'Makes sense. REST it is!', '2024-02-24 10:03:00');

-- #engineering channel - Technical discussions
INSERT INTO messages (ts, channel_id, thread_ts, user_id, text, slack_created_at)
VALUES
  ('1708617900.001400', 'TEST_ENGINEERING', NULL, 'U004', 'Anyone know how to optimize PostgreSQL for vector similarity search?', '2024-02-22 10:05:00'),
  ('1708617960.001500', 'TEST_ENGINEERING', NULL, 'U005', 'Use pgvector extension with IVFFlat index. Works great for embeddings', '2024-02-22 10:06:00'),
  ('1708618020.001600', 'TEST_ENGINEERING', NULL, 'U004', 'Thanks! What''s a good number of lists for the index?', '2024-02-22 10:07:00'),
  ('1708618080.001700', 'TEST_ENGINEERING', NULL, 'U005', 'Start with sqrt(num_rows). So for 10k vectors use 100 lists', '2024-02-22 10:08:00'),
  
  ('1708704240.001800', 'TEST_ENGINEERING', NULL, 'U004', 'We need to implement authentication for the API', '2024-02-23 10:04:00'),
  ('1708704300.001900', 'TEST_ENGINEERING', NULL, 'U005', 'JWT tokens or OAuth? What did product decide?', '2024-02-23 10:05:00'),
  ('1708704360.002000', 'TEST_ENGINEERING', NULL, 'U006', 'Product wants OAuth for better security and third-party integrations', '2024-02-23 10:06:00'),
  ('1708704420.002100', 'TEST_ENGINEERING', NULL, 'U005', 'Good choice. I''ll start on the OAuth2 implementation', '2024-02-23 10:07:00'),
  
  ('1708790640.002200', 'TEST_ENGINEERING', NULL, 'U004', 'Should we use microservices or monolith architecture?', '2024-02-24 10:04:00'),
  ('1708790700.002300', 'TEST_ENGINEERING', NULL, 'U005', 'Start with a modular monolith. Easier to develop and deploy', '2024-02-24 10:05:00'),
  ('1708790760.002400', 'TEST_ENGINEERING', NULL, 'U006', 'Agreed. We can split into microservices later if we need to scale', '2024-02-24 10:06:00'),
  ('1708790820.002500', 'TEST_ENGINEERING', NULL, 'U004', 'Decision made: Modular monolith for v1', '2024-02-24 10:07:00');

-- #design channel - Design discussions  
INSERT INTO messages (ts, channel_id, thread_ts, user_id, text, slack_created_at)
VALUES
  ('1708618140.002600', 'TEST_DESIGN', NULL, 'U007', 'Working on the mobile app redesign. Should we go with Material Design or custom UI?', '2024-02-22 10:09:00'),
  ('1708618200.002700', 'TEST_DESIGN', NULL, 'U008', 'Material Design is proven and users are familiar with it', '2024-02-22 10:10:00'),
  ('1708618260.002800', 'TEST_DESIGN', NULL, 'U007', 'True, but custom UI could help us stand out from competitors', '2024-02-22 10:11:00'),
  ('1708618320.002900', 'TEST_DESIGN', NULL, 'U008', 'Let''s do Material Design with custom color scheme and iconography', '2024-02-22 10:12:00'),
  ('1708618380.003000', 'TEST_DESIGN', NULL, 'U007', 'Perfect compromise! I''ll start on the mockups', '2024-02-22 10:13:00'),
  
  ('1708704480.003100', 'TEST_DESIGN', NULL, 'U007', 'User profile page needs to show: avatar, bio, recent activity, and stats', '2024-02-23 10:08:00'),
  ('1708704540.003200', 'TEST_DESIGN', NULL, 'U008', 'Don''t forget privacy controls. Users should be able to hide stats', '2024-02-23 10:09:00'),
  ('1708704600.003300', 'TEST_DESIGN', NULL, 'U007', 'Good point. Adding privacy toggle to the design', '2024-02-23 10:10:00');

-- Generate some realistic embeddings (simplified - just random for testing)
-- In production, these would be actual OpenAI embeddings

-- Note: We'll skip embeddings for now since generating them requires OpenAI API calls
-- The keyword search will still work for testing MCP

-- Store channel info
INSERT INTO channels (channel_id, channel_name, is_private, joined_at)
VALUES
  ('TEST_PRODUCT', 'product', false, NOW()),
  ('TEST_ENGINEERING', 'engineering', false, NOW()),
  ('TEST_DESIGN', 'design', false, NOW())
ON CONFLICT (channel_id) DO NOTHING;

-- Store user info
INSERT INTO users (user_id, real_name, display_name, is_bot)
VALUES
  ('U001', 'Jeff Nicholson', 'jeff', false),
  ('U002', 'Sarah Chen', 'sarah', false),
  ('U003', 'Mike Johnson', 'mike', false),
  ('U004', 'Alex Rodriguez', 'alex', false),
  ('U005', 'Emily Davis', 'emily', false),
  ('U006', 'Tom Wilson', 'tom', false),
  ('U007', 'Lisa Anderson', 'lisa', false),
  ('U008', 'Ryan Taylor', 'ryan', false)
ON CONFLICT (user_id) DO NOTHING;

-- Show what we inserted
SELECT 
  channel_id,
  COUNT(*) as message_count,
  MIN(slack_created_at) as first_message,
  MAX(slack_created_at) as last_message
FROM messages
WHERE channel_id LIKE 'TEST_%'
GROUP BY channel_id
ORDER BY channel_id;
