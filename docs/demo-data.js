// Demo data for GitHub Pages demo
window.DEMO_DATA = {
  decisions: [
    {
      id: 1,
      content: `After evaluating multiple payment providers, Sarah led the team to a decision on Stripe for the new checkout flow. Mike initially raised concerns about the 2.9% + 30¢ transaction fees, especially given their projected 500-1000 monthly transactions initially scaling to 5000+ within six months.

However, the team consensus leaned toward Stripe based on three key factors: superior API documentation, cleaner UI components compared to PayPal, and the team's positive past experience with the platform. While the cost difference with PayPal was minimal for their volume, Stripe's developer experience was deemed worth the investment.

The decision was finalized with Mike committing to start integration the following Monday, targeting a working prototype by Wednesday for design review. The goal is to have the checkout flow live by end of Q1.`,
      channel_id: 'C_PRODUCT',
      thread_ts: '1234567890.123456',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      content: `During the security review, Mike identified a critical vulnerability: API keys were being stored in plain text in the database. Carlos immediately agreed this was a P0 issue requiring immediate attention.

Sarah made the executive decision to pause all other development work to address the security risk. The team couldn't afford to wait given the exposure. Mike estimated 3-4 days to implement AWS KMS integration, migrate existing keys, and update all access patterns.

The decision was made to ship the fix by Friday EOD, with Mike committing to have a pull request ready by Thursday for team review. This security-first approach reflects the team's commitment to protecting customer data over feature velocity.`,
      channel_id: 'C_ENG',
      thread_ts: '1234567891.123456',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  questions: [
    {
      id: 3,
      content: `Alex raised an important question while working on the mobile navigation redesign: should the app support landscape mode on tablets, and if so, how should the navigation behave?

Sarah requested analytics from Jen to inform the decision. The data showed that 15% of tablet users rotate to landscape at some point during their sessions - a significant enough portion to warrant support.

However, the critical question remained unresolved: should the navigation collapse to a hamburger menu in landscape mode, or stay expanded to take advantage of the wider viewport? This decision is currently blocking the mobile redesign work scheduled for next sprint. The team needs to decide on the UX pattern before Alex can finalize the designs.`,
      channel_id: 'C_DESIGN',
      thread_ts: '1234567892.123456',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  topics: [
    { topic_name: 'payment', current_count: 15, trend_direction: 'stable' },
    { topic_name: 'security', current_count: 12, trend_direction: 'up' },
    { topic_name: 'mobile', current_count: 10, trend_direction: 'stable' },
    { topic_name: 'design', current_count: 8, trend_direction: 'down' },
    { topic_name: 'database', current_count: 7, trend_direction: 'stable' },
    { topic_name: 'integration', current_count: 6, trend_direction: 'stable' },
    { topic_name: 'performance', current_count: 5, trend_direction: 'up' },
    { topic_name: 'testing', current_count: 4, trend_direction: 'stable' }
  ],
  overview: {
    messages: 245,
    channels: 5,
    users: 8,
    commands: 42,
    topics: 8
  },
  suggestions: [
    { suggestion_text: '/compass decisions payment - Review payment provider discussions' },
    { suggestion_text: '/compass open-questions security - Check security blockers' },
    { suggestion_text: '/compass summarize - Summarize recent team discussions' },
    { suggestion_text: '/compass prd mobile-app - Generate mobile app PRD' }
  ]
};
