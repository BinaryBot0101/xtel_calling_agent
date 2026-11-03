export const HEADLESS_CHAT_EXAMPLE = `let chatState = 'idle';

function withXtelWidget(callback) {
  const widget = window.XtelWidget || window.XtelWidget;
  if (widget) {
    callback(widget);
    return;
  }

  const script = document.getElementById('xtel-widget') || document.getElementById('xtel-widget');
  if (!script) {
    console.error('Xtel embed script not found');
    return;
  }

  script.addEventListener('load', () => {
    const w = window.XtelWidget || window.XtelWidget;
    if (w) callback(w);
  }, { once: true });
}

withXtelWidget((widget) => {
  widget.onChatStateChange((state) => {
    chatState = state; // idle | starting | ready | waiting | ended | expired | error
  });

  widget.onMessage((text, turn) => {
    appendAgentBubble(text); // render however you want
  });

  document.getElementById('open-chat').addEventListener('click', () => {
    widget.startChat();
  });

  document.getElementById('send-btn').addEventListener('click', async () => {
    const input = document.getElementById('chat-input');
    appendVisitorBubble(input.value);
    const transcript = await widget.sendMessage(input.value);
    if (transcript !== null) input.value = '';
  });

  document.getElementById('end-chat')?.addEventListener('click', async () => {
    await widget.endChat();
  });
});`;
