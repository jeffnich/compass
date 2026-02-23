// Demo data for GitHub Pages static demo
const DEMO_COMMANDS = [
  {
    name: "prd",
    description: "Generate Product Requirements Document",
    type: "llm",
    model: "anthropic",
    enabled: true,
    usage: { total: 24, last7d: 8, last30d: 24 }
  },
  {
    name: "summarize",
    description: "Summarize thread or channel",
    type: "llm",
    model: "openai",
    enabled: true,
    usage: { total: 47, last7d: 15, last30d: 47 }
  },
  {
    name: "decisions",
    description: "Extract key decisions with context",
    type: "llm",
    model: "anthropic",
    enabled: true,
    usage: { total: 31, last7d: 12, last30d: 31 }
  },
  {
    name: "open-questions",
    description: "Extract unresolved questions from discussion",
    type: "llm",
    model: "openai",
    enabled: true,
    usage: { total: 18, last7d: 6, last30d: 18 }
  },
  {
    name: "design-review",
    description: "Review design with context",
    type: "llm",
    model: "anthropic",
    enabled: true,
    usage: { total: 12, last7d: 4, last30d: 12 }
  },
  {
    name: "api-spec",
    description: "Generate API specification",
    type: "llm",
    model: "anthropic",
    enabled: true,
    usage: { total: 9, last7d: 3, last30d: 9 }
  },
  {
    name: "retro",
    description: "Generate sprint retrospective",
    type: "llm",
    model: "openai",
    enabled: true,
    usage: { total: 15, last7d: 5, last30d: 15 }
  },
  {
    name: "user-story",
    description: "Convert feature idea to user stories",
    type: "llm",
    model: "anthropic",
    enabled: true,
    usage: { total: 22, last7d: 7, last30d: 22 }
  },
  {
    name: "tech-spec",
    description: "Generate technical specification",
    type: "llm",
    model: "anthropic",
    enabled: true,
    usage: { total: 14, last7d: 5, last30d: 14 }
  },
  {
    name: "action-items",
    description: "Extract action items from discussion",
    type: "llm",
    model: "openai",
    enabled: true,
    usage: { total: 28, last7d: 10, last30d: 28 }
  }
];

const DEMO_STATS = {
  total: 10,
  uses: 82,
  successRate: "94%",
  cost: "$4.20"
};

const DEMO_INSIGHTS = [
  {
    id: 1,
    type: "decision",
    content: "After reviewing the API options, Sarah decided the team should move forward with Stripe for payment processing. Mike raised concerns about cost, but the superior developer experience and documentation won out. The team will start integration next sprint with a target ship date of end of Q1.",
    timestamp: "2024-02-20T15:30:00Z",
    channel: "product-team",
    message_ts: "1708445400.123456",
    participants: ["Sarah", "Mike"]
  },
  {
    id: 2,
    type: "decision",
    content: "The design team decided to move forward with the redesigned onboarding flow after testing showed a 40% improvement in completion rates. Initial concerns about mobile performance were addressed by lazy-loading the tutorial videos.",
    timestamp: "2024-02-19T10:15:00Z",
    channel: "design",
    message_ts: "1708339500.234567",
    participants: ["Alex", "Jordan"]
  },
  {
    id: 3,
    type: "decision",
    content: "Engineering chose to migrate from REST to GraphQL for the mobile API. While this will require more upfront work, the team agreed the flexibility and performance gains justify the investment. Migration is scheduled for Q2.",
    timestamp: "2024-02-18T14:45:00Z",
    channel: "engineering",
    message_ts: "1708271100.345678",
    participants: ["Chris", "Taylor"]
  },
  {
    id: 4,
    type: "question",
    content: "Alex raised the question of whether the mobile app should support landscape mode on tablets. Sarah asked for usage analytics, and Jen found that 15% of users rotate to landscape. However, the team hasn't decided whether the nav should collapse or stay expanded. This is blocking the mobile redesign work scheduled for next sprint.",
    timestamp: "2024-02-21T11:20:00Z",
    channel: "product-team",
    message_ts: "1708516800.456789",
    participants: ["Alex", "Sarah", "Jen"]
  },
  {
    id: 5,
    type: "question",
    content: "The team is still unsure about the data retention policy for deleted user accounts. Legal said 90 days, but engineering noted that could complicate GDPR compliance. Morgan is reaching out to the compliance team for guidance before the privacy policy update ships next month.",
    timestamp: "2024-02-20T09:00:00Z",
    channel: "legal-tech",
    message_ts: "1708416000.567890",
    participants: ["Morgan", "Legal Team"]
  },
  {
    id: 6,
    type: "question",
    content: "During the infrastructure review, the team questioned whether to use AWS Lambda or ECS for the new notification service. Pat highlighted cost concerns with Lambda at scale, while Sam pointed out the operational overhead of managing ECS clusters. DevOps is running cost projections for both options before the Q2 planning meeting.",
    timestamp: "2024-02-17T16:30:00Z",
    channel: "infrastructure",
    message_ts: "1708191000.678901",
    participants: ["Pat", "Sam"]
  }
];
