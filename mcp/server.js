#!/usr/bin/env node
/**
 * Ion MCP Server
 * 
 * Exposes Slack workspace context to Cursor/VS Code via Model Context Protocol
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { query } = require('../db/client');

// Create MCP server
const server = new Server(
  {
    name: 'ion-slack',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_conversations',
        description: 'Search Slack conversations by keyword',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'What to search for',
            },
            channel: {
              type: 'string',
              description: 'Optional: channel ID to search within',
            },
            limit: {
              type: 'number',
              description: 'Max results to return (default: 10)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_channel_messages',
        description: 'Get recent messages from a specific channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel_id: {
              type: 'string',
              description: 'Slack channel ID',
            },
            limit: {
              type: 'number',
              description: 'Number of messages (default: 20)',
            },
          },
          required: ['channel_id'],
        },
      },
      {
        name: 'get_decision_history',
        description: 'Find product/technical decisions from Slack',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'Topic to search for',
            },
            limit: {
              type: 'number',
              description: 'Max results (default: 10)',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'list_channels',
        description: 'List all Slack channels Ion has indexed',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'search_conversations': {
        const { query: searchQuery, channel, limit = 10 } = args;
        
        let sql = `
          SELECT 
            m.text, 
            m.channel_id,
            m.user_id,
            m.slack_created_at,
            m.ts
          FROM messages m
          WHERE m.text ILIKE $1
        `;
        
        const params = [`%${searchQuery}%`];
        
        if (channel) {
          sql += ` AND m.channel_id = $2`;
          params.push(channel);
        }
        
        sql += ` ORDER BY m.slack_created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);
        
        const results = await query(sql, params);
        
        const formatted = results.rows.map(msg => ({
          channel: msg.channel_id,
          user: msg.user_id,
          timestamp: msg.slack_created_at,
          text: msg.text,
        }));
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      }
      
      case 'get_channel_messages': {
        const { channel_id, limit = 20 } = args;
        
        const messages = await query(
          `SELECT 
            m.text, 
            m.user_id,
            m.slack_created_at,
            m.ts
           FROM messages m
           WHERE m.channel_id = $1
           ORDER BY m.slack_created_at DESC
           LIMIT $2`,
          [channel_id, limit]
        );
        
        const content = messages.rows
          .reverse()
          .map(msg => `[${msg.slack_created_at.toISOString()}] ${msg.user_id}: ${msg.text}`)
          .join('\n');
        
        return {
          content: [
            {
              type: 'text',
              text: content || 'No messages found in this channel',
            },
          ],
        };
      }
      
      case 'get_decision_history': {
        const { topic, limit = 10 } = args;
        
        const decisions = await query(
          `SELECT 
            m.text, 
            m.channel_id,
            m.user_id,
            m.slack_created_at
           FROM messages m
           WHERE (
             m.text ILIKE '%decided%' OR
             m.text ILIKE '%decision%' OR
             m.text ILIKE '%agreed%' OR
             m.text ILIKE '%consensus%'
           )
           AND m.text ILIKE $1
           ORDER BY m.slack_created_at DESC
           LIMIT $2`,
          [`%${topic}%`, limit]
        );
        
        const formatted = decisions.rows.map(msg => ({
          channel: msg.channel_id,
          user: msg.user_id,
          timestamp: msg.slack_created_at,
          text: msg.text,
        }));
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      }
      
      case 'list_channels': {
        const channels = await query(
          `SELECT DISTINCT channel_id, COUNT(*) as message_count
           FROM messages
           GROUP BY channel_id
           ORDER BY message_count DESC`
        );
        
        const formatted = channels.rows.map(ch => ({
          channel_id: ch.channel_id,
          message_count: parseInt(ch.message_count),
        }));
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(formatted, null, 2),
            },
          ],
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('✅ Ion MCP Server running');
  console.error('Tools: search_conversations, get_channel_messages, get_decision_history, list_channels');
}

main().catch((error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});
