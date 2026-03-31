const fields = [
  document.getElementById('msg1'),
  document.getElementById('msg2'),
  document.getElementById('msg3'),
  document.getElementById('msg4'),
  document.getElementById('msg5')
];

const saveBtn = document.getElementById('saveBtn');
const statusEl = document.getElementById('status');

async function loadMessages() {
  try {
    const response = await fetch('/api/messages', { cache: 'no-store' });
    const data = await response.json();
    const values = Array.isArray(data.messages) ? data.messages : ['', '', '', '', ''];

    fields.forEach((field, index) => {
      field.value = values[index] || '';
    });
  } catch {
    statusEl.textContent = 'Kunne ikke hente beskeder fra serveren.';
  }
}

async function saveMessages() {
  const values = fields.map((field) => field.value.trim());

  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: values })
    });

    const data = await response.json();

    if (data.ok) {
      statusEl.textContent = 'Beskeder gemt på serveren.';
      setTimeout(() => {
        statusEl.textContent = '';
      }, 2500);
    } else {
      statusEl.textContent = 'Kunne ikke gemme beskeder.';
    }
  } catch {
    statusEl.textContent = 'Kunne ikke gemme beskeder.';
  }
}

loadMessages();
saveBtn.addEventListener('click', saveMessages);
