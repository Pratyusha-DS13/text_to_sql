import { useCallback, useEffect, useId, useRef, useState } from "react";

import "./ChatbotWidget.css";

const SUGGESTED = [
  "How do I connect my database?",
  "Is my data secure?",
  "What databases are supported?",
  "Do you store my data?",
];

function getBotReply(userText) {
  const t = userText.toLowerCase();

  if (t.includes("connect")) {
    return {
      kind: "bullets",
      intro: "To connect your database to Insight Analytics:",
      items: [
        "Add your connection details in the backend environment (host, port, user, password, database name).",
        "Ensure the database user has read-only access to the schemas you want to query.",
        "Restart the API service after changing credentials so the new settings load.",
        "Use the Ask AI flow to verify connectivity with a simple question (e.g. row counts).",
      ],
    };
  }

  if (t.includes("secure")) {
    return {
      kind: "bullets",
      intro: "Security practices we recommend:",
      items: [
        "Run the API with HTTPS in production and restrict network access to your database.",
        "Store secrets in environment variables or a secrets manager—never in source control.",
        "Use least-privilege DB accounts (read-only SELECT) dedicated to this application.",
        "Rotate API keys and database passwords on a regular schedule.",
      ],
    };
  }

  if (t.includes("store")) {
    return {
      kind: "bullets",
      intro: "Data handling:",
      items: [
        "We do not store your raw database rows or query results on our servers for training or resale.",
        "Queries run against your database in real time; results exist only in your browser session unless you export them.",
      ],
    };
  }

  if (t.includes("supported")) {
    return {
      kind: "bullets",
      intro: "Database support depends on your deployment:",
      items: [
        "This stack is commonly configured with MySQL / MariaDB via SQLAlchemy.",
        "PostgreSQL and other drivers can be used if you align the backend connection string and dependencies.",
        "Check your backend README or ops docs for the exact versions tested in your environment.",
      ],
    };
  }

  return {
    kind: "bullets",
    intro: "Try one of the suggested questions above, or rephrase using keywords like connect, secure, supported, or store.",
    items: ["I match simple keywords to show setup and security help."],
  };
}

function BotMessageBody({ payload }) {
  if (payload.kind !== "bullets") return null;
  return (
    <div className="chatbot-widget__bot-content">
      <p className="chatbot-widget__bot-intro">{payload.intro}</p>
      <ul className="chatbot-widget__bullet-list">
        {payload.items.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export function ChatbotWidget() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, scrollToBottom]);

  const sendUserText = useCallback((text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setDraft("");

    window.setTimeout(() => {
      const reply = getBotReply(trimmed);
      setMessages((prev) => [...prev, { role: "bot", payload: reply }]);
    }, 350);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    sendUserText(draft);
  };

  return (
    <div className="chatbot-widget">
      <div
        id={panelId}
        className={`chatbot-widget__panel ${open ? "chatbot-widget__panel--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${panelId}-title`}
        aria-hidden={!open}
      >
        <div className="chatbot-widget__panel-inner">
          <header className="chatbot-widget__header">
            <div>
              <h2 id={`${panelId}-title`} className="chatbot-widget__title">
                Setup &amp; Security Assistant
              </h2>
              <p className="chatbot-widget__subtitle">Quick answers for connecting and trusting your data</p>
            </div>
            <button
              type="button"
              className="chatbot-widget__close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </header>

          <div className="chatbot-widget__chips" role="group" aria-label="Suggested questions">
            {SUGGESTED.map((q) => (
              <button key={q} type="button" className="chatbot-widget__chip" onClick={() => sendUserText(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className="chatbot-widget__messages-wrap">
            <ul ref={listRef} className="chatbot-widget__messages" aria-live="polite">
              {messages.length === 0 && (
                <li className="chatbot-widget__hint">Ask anything below, or tap a suggestion.</li>
              )}
              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <li key={i} className="chatbot-widget__row chatbot-widget__row--user">
                    <span className="chatbot-widget__bubble chatbot-widget__bubble--user">{msg.text}</span>
                  </li>
                ) : (
                  <li key={i} className="chatbot-widget__row chatbot-widget__row--bot">
                    <span className="chatbot-widget__bubble chatbot-widget__bubble--bot">
                      <BotMessageBody payload={msg.payload} />
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>

          <form className="chatbot-widget__form" onSubmit={onSubmit}>
            <input
              type="text"
              className="chatbot-widget__input"
              placeholder="Type a question…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Message"
            />
            <button type="submit" className="chatbot-widget__send" disabled={!draft.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>

      <button
        type="button"
        className={`chatbot-widget__fab ${open ? "chatbot-widget__fab--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close assistant" : "Open Setup & Security Assistant"}
      >
        <span className="chatbot-widget__fab-icon" aria-hidden="true">
          {open ? (
            "×"
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
