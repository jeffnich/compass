/**
 * Workspace Intelligence Dashboard
 * Frontend logic for insights page
 */

const API_BASE = window.location.origin + '/api/insights';
let currentTimeRange = 7;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Workspace Intelligence Dashboard');
  
  setupEventListeners();
  setupTabs();
  loadDashboard();
});

function setupEventListeners() {
  // Time range selector
  const timeRange = document.getElementById('time-range');
  if (timeRange) {
    timeRange.addEventListener('change', (e) => {
      currentTimeRange = parseInt(e.target.value);
      loadDashboard();
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadDashboard();
    });
  }

  // Analyze button
  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      runAnalysis();
    });
  }
}

function setupTabs() {
  // Get current tab from URL or default to overview
  const urlParams = new URLSearchParams(window.location.search);
  const currentTab = urlParams.get('tab') || 'overview';
  
  // Setup nav link click handlers
  const navLinks = document.querySelectorAll('.nav-link[data-tab]');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.dataset.tab;
      
      // Remove active from all nav links and content
      document.querySelectorAll('.nav-link[data-tab]').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      // Add active to clicked link and corresponding content
      link.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
      
      // Update URL without reload
      window.history.pushState({}, '', `/insights.html?tab=${targetTab}`);
    });
  });
  
  // Show initial tab based on URL
  document.querySelectorAll('.nav-link[data-tab]').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  const activeLink = document.querySelector(`.nav-link[data-tab="${currentTab}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
  
  const activeContent = document.getElementById(`tab-${currentTab}`);
  if (activeContent) {
    activeContent.classList.add('active');
  }
}

let loadInProgress = false;

async function loadDashboard() {
  if (loadInProgress) {
    console.log('Load already in progress, skipping');
    return;
  }
  
  loadInProgress = true;
  showLoading(true);
  
  try {
    await Promise.all([
      loadOverview(),
      loadDecisions(),
      loadQuestions(),
      loadTopics(),
      loadActivity(),
      loadSuggestions(),
    ]);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError('Failed to load dashboard data');
  } finally {
    showLoading(false);
    loadInProgress = false;
  }
}

async function loadOverview() {
  try {
    const response = await fetch(`${API_BASE}/overview?days=${currentTimeRange}`);
    const data = await response.json();
    
    if (data.stats) {
      document.getElementById('stat-messages').textContent = formatNumber(data.stats.messages);
      document.getElementById('stat-channels').textContent = formatNumber(data.stats.channels);
      document.getElementById('stat-users').textContent = formatNumber(data.stats.users);
      document.getElementById('stat-commands').textContent = formatNumber(data.stats.commands);
    }
  } catch (error) {
    console.error('Error loading overview:', error);
  }
}

async function loadDecisions() {
  try {
    const response = await fetch(`${API_BASE}/decisions?days=${currentTimeRange}&limit=20`);
    const data = await response.json();
    
    const container = document.getElementById('decisions-list');
    const countBadge = document.getElementById('decisions-count');
    
    if (data.decisions && data.decisions.length > 0) {
      countBadge.textContent = data.decisions.length;
      container.innerHTML = data.decisions.map(d => renderDecisionCard(d)).join('');
    } else {
      container.innerHTML = `
        <div class="empty-state">
          
          <p>No decisions found</p>
          <small>Run analysis to extract key decisions from conversations</small>
        </div>
      `;
      countBadge.textContent = '0';
    }
  } catch (error) {
    console.error('Error loading decisions:', error);
  }
}

async function loadQuestions() {
  try {
    const response = await fetch(`${API_BASE}/questions?status=open&days=${currentTimeRange}&limit=20`);
    const data = await response.json();
    
    const container = document.getElementById('questions-list');
    const countBadge = document.getElementById('questions-count');
    
    if (data.questions && data.questions.length > 0) {
      countBadge.textContent = data.questions.length;
      container.innerHTML = data.questions.map(q => renderQuestionCard(q)).join('');
    } else {
      container.innerHTML = `
        <div class="empty-state">
          
          <p>No open questions</p>
          <small>Run analysis to find unanswered questions</small>
        </div>
      `;
      countBadge.textContent = '0';
    }
  } catch (error) {
    console.error('Error loading questions:', error);
  }
}

async function loadTopics() {
  try {
    const response = await fetch(`${API_BASE}/topics?days=${currentTimeRange}&limit=10`);
    const data = await response.json();
    
    const container = document.getElementById('topics-list');
    
    if (data.topics && data.topics.length > 0) {
      // Find max count for scaling bars
      const maxCount = Math.max(...data.topics.map(t => t.current_count));
      container.innerHTML = data.topics.map(t => renderTopicCard(t, maxCount)).join('');
    } else {
      container.innerHTML = `
        <div class="empty-state">
          
          <p>No trending topics</p>
          <small>Run analysis to identify discussion topics</small>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading topics:', error);
  }
}

async function loadActivity() {
  try {
    const response = await fetch(`${API_BASE}/activity?days=${currentTimeRange}`);
    const data = await response.json();
    
    const container = document.getElementById('activity-table');
    
    if (data.activity && data.activity.length > 0) {
      container.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Messages</th>
              <th>Channels</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            ${data.activity.map(a => renderActivityRow(a)).join('')}
          </tbody>
        </table>
      `;
    } else {
      container.innerHTML = `
        <div class="empty-state">
          
          <p>No activity data</p>
          <small>Activity will appear here once messages are indexed</small>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading activity:', error);
  }
}

async function loadSuggestions() {
  try {
    const response = await fetch(`${API_BASE}/suggestions`);
    const data = await response.json();
    
    const container = document.getElementById('suggestions-list');
    
    if (data.suggestions && data.suggestions.length > 0) {
      container.innerHTML = data.suggestions.map(s => renderSuggestionCard(s)).join('');
    } else {
      container.innerHTML = `
        <div class="empty-state">
          
          <p>No suggestions yet</p>
          <small>AI will suggest useful questions based on recent activity</small>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading suggestions:', error);
  }
}

function renderDecisionCard(decision) {
  const date = formatDate(decision.created_at);
  
  // Skip low-quality decisions (no channel/thread)
  if (!decision.channel_id || !decision.thread_ts) {
    return '';
  }
  
  const clickHandler = decision.channel_id && decision.thread_ts 
    ? `onclick="openThread('${decision.channel_id}', '${decision.thread_ts}')" style="cursor: pointer;"` 
    : '';
  
  // Use full content as narrative (skip parsing for natural text)
  const content = (decision.content || decision.summary || 'No details available')
    .replace(/^Here is a summary.*?:\n\n/i, '')
    .replace(/^Based on.*?:\n\n/i, '')
    .trim();
  
  // Split into sentences for better readability
  const formattedContent = content
    .split(/\.\s+/)
    .filter(s => s.trim())
    .map(s => s.trim() + (s.endsWith('.') ? '' : '.'))
    .join(' ');
  
  return `
    <div class="insight-card decision-card" ${clickHandler}>
      <div class="insight-header">
        <div class="insight-badge decision-badge">Decision</div>
      </div>
      <div class="insight-content">
        <div class="insight-narrative">${escapeHtml(formattedContent)}</div>
        <div class="insight-meta">
          <span>${date}</span>
          ${decision.channel_name ? `<span>#${decision.channel_name}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderQuestionCard(question) {
  const date = formatDate(question.created_at);
  
  // Skip low-quality questions (no channel/thread)
  if (!question.channel_id || !question.thread_ts) {
    return '';
  }
  
  const clickHandler = question.channel_id && question.thread_ts 
    ? `onclick="openThread('${question.channel_id}', '${question.thread_ts}')" style="cursor: pointer;"` 
    : '';
  
  // Use full content as narrative (skip parsing for natural text)
  const content = (question.content || question.summary || 'No details available')
    .replace(/^Here is a summary.*?:\n\n/i, '')
    .replace(/^Based on.*?:\n\n/i, '')
    .trim();
  
  // Split into sentences for better readability
  const formattedContent = content
    .split(/\.\s+/)
    .filter(s => s.trim())
    .map(s => s.trim() + (s.endsWith('.') ? '' : '.'))
    .join(' ');
  
  return `
    <div class="insight-card question-card" ${clickHandler}>
      <div class="insight-header">
        <div class="insight-badge question-badge">Question</div>
      </div>
      <div class="insight-content">
        <div class="insight-narrative">${escapeHtml(formattedContent)}</div>
        <div class="insight-meta">
          <span>${date}</span>
          ${question.channel_name ? `<span>#${question.channel_name}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderTopicCard(topic, maxCount) {
  const percentage = (topic.current_count / maxCount) * 100;
  
  return `
    <div class="topic-row">
      <div class="topic-label-col">
        <span class="topic-word">${escapeHtml(topic.topic_name)}</span>
      </div>
      <div class="topic-bar-col">
        <div class="topic-bar-bg">
          <div class="topic-bar-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
      <div class="topic-count-col">
        <span class="topic-count-value">${topic.current_count}</span>
      </div>
    </div>
  `;
}

function renderActivityRow(activity) {
  const name = activity.display_name || activity.real_name || activity.user_id;
  const channels = activity.channels ? activity.channels.slice(0, 3) : [];
  const lastActive = formatDate(activity.last_active);
  
  return `
    <tr>
      <td>
        <div class="user-info">
          <div class="user-name">${escapeHtml(name)}</div>
        </div>
      </td>
      <td><strong>${formatNumber(activity.message_count)}</strong></td>
      <td>
        <div class="channel-tags">
          ${channels.map(c => `<span class="channel-tag">#${c}</span>`).join('')}
        </div>
      </td>
      <td>${lastActive}</td>
    </tr>
  `;
}

function renderSuggestionCard(suggestion) {
  return `
    <div class="suggestion-card" onclick="copySuggestion('${escapeHtml(suggestion.suggestion_text)}')">
      <div class="suggestion-text">${escapeHtml(suggestion.suggestion_text)}</div>
    </div>
  `;
}

async function runAnalysis() {
  const btn = document.getElementById('analyze-btn');
  const originalText = btn.textContent;
  
  btn.textContent = 'Analyzing...';
  btn.disabled = true;
  
  try {
    const response = await fetch(`${API_BASE}/analyze`, { method: 'POST' });
    const data = await response.json();
    
    // Show success message
    showSuccess('Analysis started! Results will appear shortly.');
    
    // Reload dashboard after a delay
    setTimeout(() => {
      loadDashboard();
    }, 3000);
  } catch (error) {
    console.error('Error running analysis:', error);
    showError('Failed to start analysis');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// Utility functions
function showLoading(show) {
  const overlay = document.getElementById('loading');
  if (overlay) {
    overlay.classList.toggle('hidden', !show);
  }
}

function showSuccess(message) {
  // Simple console log for now - could be replaced with toast notification
  console.log('✅', message);
  alert(message);
}

function showError(message) {
  console.error('❌', message);
  alert(message);
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getStatusBadge(status) {
  const badges = {
    implemented: { text: 'Implemented', class: 'badge-success' },
    pending: { text: '⏳ Pending', class: 'badge-pending' },
    discussed: { text: 'Discussed', class: 'badge-info' },
    abandoned: { text: 'Abandoned', class: 'badge-warning' },
  };
  return badges[status] || { text: status, class: 'badge-info' };
}

function getTrendIcon(direction) {
  const icons = {
    up: '↑',
    down: '↓',
    stable: '→',
    new: '★',
  };
  return icons[direction] || '➡️';
}

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function openThread(channelId, threadTs) {
  if (!channelId || !threadTs) return;
  
  // Get workspace team ID from bot token (T0AFZ3N8E is the team ID)
  // Format: https://app.slack.com/client/TEAM_ID/CHANNEL_ID/THREAD_TS
  const teamId = 'T0AFZ3N8E';
  
  // Convert thread_ts to p-format (remove decimal, prefix with p)
  const threadId = 'p' + threadTs.replace('.', '');
  
  // Build Slack web URL
  const slackUrl = `https://app.slack.com/client/${teamId}/${channelId}/${threadId}`;
  window.open(slackUrl, '_blank');
}

function copySuggestion(text) {
  navigator.clipboard.writeText(text).then(() => {
    showSuccess('Copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Parse structured decision content
function parseDecisionContent(content) {
  if (!content) return { decision: 'No details available' };
  
  // If content is short (summary was truncated), just show it all
  if (content.length < 300 && !content.includes('**Decision:**')) {
    return {
      decision: content.replace(/^Based on.*?:\n\n/s, '').trim(),
      who: '',
      why: '',
      impact: '',
      status: ''
    };
  }
  
  const lines = content.split('\n');
  const result = {
    decision: '',
    who: '',
    why: '',
    impact: '',
    status: '',
  };
  
  let currentField = null;
  
  // Extract structured fields (multi-line aware)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('**Decision**:') || line.startsWith('Decision:')) {
      currentField = 'decision';
      result.decision = line.replace('**Decision**:', '').replace('Decision:', '').trim();
    } else if (line.startsWith('**Who**:') || line.startsWith('Who:')) {
      currentField = 'who';
      result.who = line.replace('**Who**:', '').replace('Who:', '').trim();
    } else if (line.startsWith('**Why**:') || line.startsWith('Why:')) {
      currentField = 'why';
      result.why = line.replace('**Why**:', '').replace('Why:', '').trim();
    } else if (line.startsWith('**Impact**:') || line.startsWith('Impact:')) {
      currentField = 'impact';
      result.impact = line.replace('**Impact**:', '').replace('Impact:', '').trim();
    } else if (line.startsWith('**Status**:') || line.startsWith('Status:')) {
      currentField = 'status';
      result.status = line.replace('**Status**:', '').replace('Status:', '').trim();
    } else if (currentField && line && !line.startsWith('**')) {
      // Continue adding to current field (multi-line support)
      result[currentField] += ' ' + line;
    }
  }
  
  // Clean up extra whitespace
  Object.keys(result).forEach(key => {
    result[key] = result[key].replace(/\s+/g, ' ').trim();
  });
  
  // If no structured content found, show full content
  if (!result.decision) {
    const cleaned = content.replace(/^Based on.*?:\n\n/s, '').trim();
    result.decision = cleaned.substring(0, 300) + (cleaned.length > 300 ? '...' : '');
  }
  
  return result;
}

// Parse structured question content
function parseQuestionContent(content) {
  if (!content) return { question: 'No details available' };
  
  // If content is short (summary was truncated), just show it all
  if (content.length < 300 && !content.includes('**Question:**')) {
    return {
      question: content.replace(/^Analyze.*?:\n\n/s, '').trim(),
      askedBy: '',
      context: '',
      blockers: '',
      status: ''
    };
  }
  
  const lines = content.split('\n');
  const result = {
    question: '',
    askedBy: '',
    context: '',
    blockers: '',
    status: '',
  };
  
  let currentField = null;
  
  // Extract structured fields (multi-line aware)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('**Question**:') || line.startsWith('Question:')) {
      currentField = 'question';
      result.question = line.replace('**Question**:', '').replace('Question:', '').trim();
    } else if (line.startsWith('**Asked by**:') || line.startsWith('Asked by:')) {
      currentField = 'askedBy';
      result.askedBy = line.replace('**Asked by**:', '').replace('Asked by:', '').trim();
    } else if (line.startsWith('**Context**:') || line.startsWith('Context:')) {
      currentField = 'context';
      result.context = line.replace('**Context**:', '').replace('Context:', '').trim();
    } else if (line.startsWith('**Blockers**:') || line.startsWith('Blockers:')) {
      currentField = 'blockers';
      result.blockers = line.replace('**Blockers**:', '').replace('Blockers:', '').trim();
    } else if (line.startsWith('**Status**:') || line.startsWith('Status:')) {
      currentField = 'status';
      result.status = line.replace('**Status**:', '').replace('Status:', '').trim();
    } else if (currentField && line && !line.startsWith('**')) {
      // Continue adding to current field (multi-line support)
      result[currentField] += ' ' + line;
    }
  }
  
  // Clean up extra whitespace
  Object.keys(result).forEach(key => {
    result[key] = result[key].replace(/\s+/g, ' ').trim();
  });
  
  // If no structured content found, show full content
  if (!result.question) {
    const cleaned = content.replace(/^Analyze.*?:\n\n/s, '').trim();
    result.question = cleaned.substring(0, 300) + (cleaned.length > 300 ? '...' : '');
  }
  
  return result;
}

// Format user ID to readable name
function formatUserId(userId) {
  if (!userId) return '';
  
  // Strip Slack user ID format (U0AGAB8NE9K -> User)
  if (userId.startsWith('U0') && userId.length > 10) {
    return `@user_${userId.substring(userId.length - 4)}`;
  }
  
  return userId;
}
