const API_BASE = 'http://localhost:3002/api';

let commands = [];
let currentCommand = null;
let editMode = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCommands();
  loadStats();
  loadCosts();
  
  // Event listeners
  document.getElementById('new-cmd-btn').addEventListener('click', () => openEditor());
  document.getElementById('save-btn').addEventListener('click', saveCommand);
  document.getElementById('test-btn').addEventListener('click', () => toggleTestPanel());
  document.getElementById('delete-btn').addEventListener('click', deleteCurrentCommand);
  
  // Type toggle
  document.querySelectorAll('input[name="cmd-type"]').forEach(radio => {
    radio.addEventListener('change', toggleCommandType);
  });
});

// Load commands
async function loadCommands() {
  try {
    const res = await fetch(`${API_BASE}/commands`);
    commands = await res.json();
    renderCommands();
  } catch (err) {
    console.error('Failed to load commands:', err);
    document.getElementById('command-list').innerHTML = '<div class="loading">Failed to load commands</div>';
  }
}

// Load stats
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const stats = await res.json();
    
    document.getElementById('stat-total').textContent = commands.length;
    document.getElementById('stat-uses').textContent = stats.overall.total_commands;
    document.getElementById('stat-success').textContent = stats.overall.success_rate + '%';
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// Load costs
async function loadCosts() {
  try {
    const res = await fetch(`${API_BASE}/stats/costs`);
    const costs = await res.json();
    
    document.getElementById('stat-cost').textContent = '$' + costs.total_cost;
  } catch (err) {
    console.error('Failed to load costs:', err);
  }
}

// Render commands
function renderCommands() {
  const list = document.getElementById('command-list');
  
  if (commands.length === 0) {
    list.innerHTML = `
      <div class="loading">
        No commands yet. Click "+ New Command" to get started!
      </div>
    `;
    return;
  }
  
  list.innerHTML = commands.map(cmd => {
    // Removed emoji icons
    const type = cmd.type || 'llm';
    
    return `
      <div class="command-card">
        <div class="command-info">
          <div class="command-name">/${cmd.name}</div>
          <div class="command-description">${cmd.description || 'No description'}</div>
          <div class="command-meta">
            <span class="command-meta-item">
              <span class="badge ${cmd.enabled ? 'badge-enabled' : 'badge-disabled'}">
                ${cmd.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </span>
            <span class="command-meta-item">
              <span class="badge badge-${type}">
                ${type}
              </span>
            </span>
            ${cmd.model ? `<span class="command-meta-item">
              <span class="badge badge-${cmd.model}">
                ${cmd.model}
              </span>
            </span>` : ''}
            <span class="command-meta-item">${cmd.stats.uses_7d} uses (7d)</span>
            <span class="command-meta-item">${cmd.stats.success_rate}% success</span>
          </div>
        </div>
        <div class="command-actions">
          <button class="btn btn-secondary btn-small" onclick="editCommand('${cmd.name}')">Edit</button>
        </div>
      </div>
    `;
  }).join('');
}

// Open editor
function openEditor(commandName = null) {
  currentCommand = commandName;
  editMode = !!commandName;
  
  const modal = document.getElementById('editor-modal');
  modal.classList.remove('hidden');
  
  if (editMode) {
    // Load existing command
    const cmd = commands.find(c => c.name === commandName);
    document.getElementById('modal-title').textContent = `Edit Command: /${commandName}`;
    document.getElementById('cmd-name').value = '/' + commandName;
    document.getElementById('cmd-name').disabled = true;
    document.getElementById('cmd-description').value = cmd.description || '';
    document.getElementById('cmd-model').value = cmd.model || 'openai';
    document.getElementById('cmd-enabled').checked = cmd.enabled !== false;
    
    // Show delete button in edit mode
    document.getElementById('delete-btn').style.display = 'block';
    
    if (cmd.type === 'deterministic') {
      document.querySelector('input[name="cmd-type"][value="deterministic"]').checked = true;
      document.getElementById('cmd-response').value = cmd.response || '';
      toggleCommandType();
    } else {
      document.querySelector('input[name="cmd-type"][value="llm"]').checked = true;
      document.getElementById('cmd-prompt').value = cmd.prompt || '';
      toggleCommandType();
    }
    
    // Load version history
    loadVersions(commandName);
  } else {
    // New command
    document.getElementById('modal-title').textContent = 'New Command';
    document.getElementById('cmd-name').disabled = false;
    document.getElementById('cmd-name').value = '';
    document.getElementById('cmd-description').value = '';
    document.getElementById('cmd-model').value = 'openai';
    document.getElementById('cmd-prompt').value = '';
    document.getElementById('cmd-response').value = '';
    document.getElementById('cmd-enabled').checked = true;
    document.querySelector('input[name="cmd-type"][value="llm"]').checked = true;
    toggleCommandType();
    document.getElementById('version-panel').classList.add('hidden');
    
    // Hide delete button for new commands
    document.getElementById('delete-btn').style.display = 'none';
  }
  
  document.getElementById('test-panel').classList.add('hidden');
}

// Close editor
function closeEditor() {
  document.getElementById('editor-modal').classList.add('hidden');
  currentCommand = null;
  editMode = false;
}

// Toggle command type (LLM vs deterministic)
function toggleCommandType() {
  const type = document.querySelector('input[name="cmd-type"]:checked').value;
  
  if (type === 'llm') {
    document.getElementById('llm-options').classList.remove('hidden');
    document.getElementById('static-options').classList.add('hidden');
  } else {
    document.getElementById('llm-options').classList.add('hidden');
    document.getElementById('static-options').classList.remove('hidden');
  }
}

// Save command
async function saveCommand() {
  const name = document.getElementById('cmd-name').value.trim();
  const description = document.getElementById('cmd-description').value.trim();
  const type = document.querySelector('input[name="cmd-type"]:checked').value;
  const model = document.getElementById('cmd-model').value;
  const prompt = document.getElementById('cmd-prompt').value.trim();
  const response = document.getElementById('cmd-response').value.trim();
  const enabled = document.getElementById('cmd-enabled').checked;
  
  if (!name) {
    alert('Command name is required');
    return;
  }
  
  if (!name.startsWith('/')) {
    alert('Command name must start with /');
    return;
  }
  
  const data = {
    name,
    description,
    model,
    enabled,
    type,
  };
  
  if (type === 'llm') {
    if (!prompt) {
      alert('Prompt is required for LLM commands');
      return;
    }
    data.prompt = prompt;
  } else {
    if (!response) {
      alert('Response is required for deterministic commands');
      return;
    }
    data.response = response;
  }
  
  try {
    const method = editMode ? 'PUT' : 'POST';
    const url = editMode 
      ? `${API_BASE}/commands/${currentCommand}`
      : `${API_BASE}/commands`;
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save command');
    }
    
    closeEditor();
    await loadCommands();
    await loadStats();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Edit command
function editCommand(name) {
  openEditor(name);
}

// Delete command (from card)
async function deleteCommand(name) {
  if (!confirm(`Delete command /${name}?`)) {
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/commands/${name}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      throw new Error('Failed to delete command');
    }
    
    await loadCommands();
    await loadStats();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Delete current command (from modal)
async function deleteCurrentCommand() {
  if (!currentCommand) return;
  
  if (!confirm(`Delete command /${currentCommand}? This cannot be undone.`)) {
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/commands/${currentCommand}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      throw new Error('Failed to delete command');
    }
    
    closeEditor();
    await loadCommands();
    await loadStats();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Toggle test panel
function toggleTestPanel() {
  const panel = document.getElementById('test-panel');
  panel.classList.toggle('hidden');
}

// Run test
async function runTest() {
  const input = document.getElementById('test-input').value;
  const result = document.getElementById('test-result');
  
  result.textContent = 'Testing...';
  
  try {
    const res = await fetch(`${API_BASE}/commands/${currentCommand}/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Test failed');
    }
    
    result.textContent = data.response;
  } catch (err) {
    result.textContent = 'Error: ' + err.message;
  }
}

// Load versions
async function loadVersions(commandName) {
  try {
    const res = await fetch(`${API_BASE}/commands/${commandName}`);
    const data = await res.json();
    
    if (!data.versions || data.versions.length === 0) {
      return;
    }
    
    const panel = document.getElementById('version-panel');
    const list = document.getElementById('version-list');
    
    list.innerHTML = data.versions.map(v => `
      <div class="version-item">
        <div class="version-info">
          ${new Date(v.created_at).toLocaleString()} - ${v.created_by}
        </div>
        <button class="btn btn-secondary btn-small" onclick="rollback('${commandName}', ${v.id})">
          Rollback
        </button>
      </div>
    `).join('');
    
    panel.classList.remove('hidden');
  } catch (err) {
    console.error('Failed to load versions:', err);
  }
}

// Rollback to version
async function rollback(commandName, versionId) {
  if (!confirm('Rollback to this version?')) {
    return;
  }
  
  try {
    const res = await fetch(`${API_BASE}/commands/${commandName}/rollback/${versionId}`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      throw new Error('Rollback failed');
    }
    
    alert('Rolled back successfully');
    closeEditor();
    await loadCommands();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

// Export commands
async function exportCommands() {
  try {
    const res = await fetch(`${API_BASE}/commands`);
    const commands = await res.json();
    
    const blob = new Blob([JSON.stringify(commands, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ion-commands-${Date.now()}.json`;
    a.click();
  } catch (err) {
    alert('Export failed: ' + err.message);
  }
}

// Import commands
function importCommands() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      if (!Array.isArray(imported)) {
        throw new Error('Invalid format');
      }
      
      // Import each command
      for (const cmd of imported) {
        await fetch(`${API_BASE}/commands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: '/' + cmd.name,
            ...cmd,
          }),
        });
      }
      
      alert(`Imported ${imported.length} commands`);
      await loadCommands();
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };
  
  input.click();
}

// Open templates
function openTemplates() {
  // TODO: Implement template browser
}

// Close templates
function closeTemplates() {
  document.getElementById('template-modal').classList.add('hidden');
}
