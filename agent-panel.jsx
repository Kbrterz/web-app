import { useState, useEffect, useRef } from "react";

const AGENTS = [
  {
    id: "researcher",
    name: "Araştırmacı",
    icon: "🔍",
    color: "#00d4ff",
    desc: "Web'de araştırma yapar, kaynak bulur",
    systemPrompt: "Sen bir araştırma uzmanısın. Kullanıcının sorularını derinlemesine araştır, güvenilir kaynaklar bul ve kapsamlı özet sun. Türkçe yanıt ver.",
  },
  {
    id: "coder",
    name: "Kod Yazarı",
    icon: "💻",
    color: "#a78bfa",
    desc: "Kod yazar, hata düzeltir, açıklar",
    systemPrompt: "Sen bir senior yazılım geliştiricisin. Temiz, verimli ve açıklamalı kod yaz. Her zaman best practice'leri uygula. Türkçe açıkla, kod İngilizce olabilir.",
  },
  {
    id: "writer",
    name: "İçerik Yazarı",
    icon: "✍️",
    color: "#f59e0b",
    desc: "Blog, sosyal medya, metin üretir",
    systemPrompt: "Sen yaratıcı bir içerik yazarısın. Etkileyici, özgün ve hedef kitleye uygun içerik üret. SEO dostu, okunabilir ve ilgi çekici metinler yaz. Türkçe yaz.",
  },
  {
    id: "analyst",
    name: "Veri Analisti",
    icon: "📊",
    color: "#10b981",
    desc: "Veri analiz eder, içgörü çıkarır",
    systemPrompt: "Sen bir veri analisti uzmanısın. Verileri analiz et, örüntüler bul, anlamlı içgörüler çıkar ve sonuçları net bir şekilde açıkla. Türkçe yanıt ver.",
  },
  {
    id: "translator",
    name: "Çevirmen",
    icon: "🌍",
    color: "#f43f5e",
    desc: "Diller arası çeviri yapar",
    systemPrompt: "Sen profesyonel bir çevirmensin. Metinleri doğal, akıcı ve bağlama uygun şekilde çevir. Kültürel nüansları koru. Hangi dile çevireceğini kullanıcıdan anla.",
  },
  {
    id: "brainstorm",
    name: "Fikir Üretici",
    icon: "💡",
    color: "#fb923c",
    desc: "Yaratıcı fikirler ve çözümler üretir",
    systemPrompt: "Sen yaratıcı düşünme uzmanısın. Alışılmadık, yenilikçi ve pratik fikirler üret. Beyin fırtınası yap, farklı perspektifler sun, kutunun dışında düşün. Türkçe yanıt ver.",
  },
];

function AgentChat({ agent, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: agent.systemPrompt,
          messages: newMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Yanıt alınamadı.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Bir hata oluştu." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)"
    }}>
      <div style={{
        width: "min(680px, 95vw)", height: "min(600px, 90vh)",
        background: "#0d0d14", border: `1px solid ${agent.color}44`,
        borderRadius: "16px", display: "flex", flexDirection: "column",
        overflow: "hidden", boxShadow: `0 0 60px ${agent.color}22`
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${agent.color}33`,
          display: "flex", alignItems: "center", gap: "12px",
          background: `linear-gradient(135deg, ${agent.color}11, transparent)`
        }}>
          <span style={{ fontSize: "24px" }}>{agent.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: agent.color, fontWeight: 700, fontSize: "15px", fontFamily: "monospace" }}>
              {agent.name}
            </div>
            <div style={{ color: "#666", fontSize: "11px", fontFamily: "monospace" }}>{agent.desc}</div>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: `1px solid #333`, color: "#666",
            width: 32, height: 32, borderRadius: "8px", cursor: "pointer",
            fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center"
          }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: "center", color: "#444", fontFamily: "monospace",
              fontSize: "13px", marginTop: "40px"
            }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>{agent.icon}</div>
              <div style={{ color: agent.color, opacity: 0.7 }}>{agent.name} hazır.</div>
              <div>Bir şey sor...</div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start"
            }}>
              <div style={{
                maxWidth: "80%", padding: "10px 14px", borderRadius: "12px",
                fontSize: "13px", lineHeight: 1.6, fontFamily: "monospace",
                background: m.role === "user" ? `${agent.color}22` : "#1a1a2e",
                border: `1px solid ${m.role === "user" ? agent.color + "44" : "#2a2a3e"}`,
                color: m.role === "user" ? "#e0e0e0" : "#c0c0d0",
                whiteSpace: "pre-wrap"
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex" }}>
              <div style={{
                padding: "10px 14px", borderRadius: "12px", background: "#1a1a2e",
                border: `1px solid #2a2a3e`, fontFamily: "monospace", fontSize: "13px"
              }}>
                <span style={{ color: agent.color, animation: "pulse 1s infinite" }}>●●●</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px", borderTop: `1px solid ${agent.color}22`,
          display: "flex", gap: "8px"
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Mesajınızı yazın..."
            style={{
              flex: 1, background: "#111120", border: `1px solid ${agent.color}33`,
              borderRadius: "8px", color: "#e0e0e0", padding: "10px 14px",
              fontFamily: "monospace", fontSize: "13px", outline: "none"
            }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
            background: loading ? "#222" : `linear-gradient(135deg, ${agent.color}, ${agent.color}99)`,
            border: "none", borderRadius: "8px", color: "#000", padding: "10px 18px",
            cursor: loading ? "not-allowed" : "pointer", fontWeight: 700,
            fontSize: "16px", transition: "all 0.2s"
          }}>→</button>
        </div>
      </div>
    </div>
  );
}

export default function AgentPanel() {
  const [activeAgent, setActiveAgent] = useState(null);
  const [customAgents, setCustomAgents] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", icon: "🤖", desc: "", systemPrompt: "" });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("custom-agents");
        if (r?.value) setCustomAgents(JSON.parse(r.value));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const saveCustomAgent = async () => {
    if (!newAgent.name || !newAgent.systemPrompt) return;
    const updated = [...customAgents, { ...newAgent, id: `custom-${Date.now()}`, color: "#888" }];
    setCustomAgents(updated);
    await window.storage.set("custom-agents", JSON.stringify(updated));
    setAdding(false);
    setNewAgent({ name: "", icon: "🤖", desc: "", systemPrompt: "" });
  };

  const removeCustomAgent = async (id) => {
    const updated = customAgents.filter(a => a.id !== id);
    setCustomAgents(updated);
    await window.storage.set("custom-agents", JSON.stringify(updated));
  };

  const allAgents = [...AGENTS, ...customAgents];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .agent-card { transition: all 0.2s; cursor: pointer; }
        .agent-card:hover { transform: translateX(4px); }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
        .agent-card { animation: slideIn 0.3s ease forwards; }
      `}</style>

      <div style={{
        width: "260px", height: "100vh", background: "#080810",
        borderRight: "1px solid #1a1a2a", fontFamily: "'JetBrains Mono', monospace",
        display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 16px 14px",
          borderBottom: "1px solid #1a1a2a",
          background: "linear-gradient(180deg, #0d0d1a, #080810)"
        }}>
          <div style={{ color: "#fff", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}>
            ⚡ AI AGENTLARI
          </div>
          <div style={{ color: "#444", fontSize: "10px", marginTop: "4px" }}>
            {allAgents.length} agent hazır
          </div>
        </div>

        {/* Agents */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
          {allAgents.map((agent, i) => (
            <div
              key={agent.id}
              className="agent-card"
              onClick={() => setActiveAgent(agent)}
              style={{
                animationDelay: `${i * 0.05}s`,
                padding: "10px 12px", marginBottom: "4px",
                borderRadius: "10px", border: `1px solid ${agent.color}22`,
                background: `linear-gradient(135deg, ${agent.color}08, transparent)`,
                display: "flex", alignItems: "center", gap: "10px", position: "relative"
              }}
            >
              <div style={{
                width: "36px", height: "36px", borderRadius: "8px",
                background: `${agent.color}18`, border: `1px solid ${agent.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", flexShrink: 0
              }}>{agent.icon}</div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ color: agent.color, fontSize: "12px", fontWeight: 600 }}>{agent.name}</div>
                <div style={{ color: "#444", fontSize: "10px", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {agent.desc}
                </div>
              </div>
              {agent.id.startsWith("custom-") && (
                <button
                  onClick={e => { e.stopPropagation(); removeCustomAgent(agent.id); }}
                  style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: "12px", padding: "2px" }}
                >✕</button>
              )}
            </div>
          ))}

          {/* Add custom */}
          {!adding ? (
            <button onClick={() => setAdding(true)} style={{
              width: "100%", padding: "10px", marginTop: "8px",
              background: "none", border: "1px dashed #222", borderRadius: "10px",
              color: "#333", fontSize: "11px", cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.2s"
            }}
              onMouseEnter={e => { e.target.style.borderColor = "#555"; e.target.style.color = "#555"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#222"; e.target.style.color = "#333"; }}
            >+ Yeni Agent Ekle</button>
          ) : (
            <div style={{
              padding: "12px", marginTop: "8px", background: "#0f0f1e",
              border: "1px solid #2a2a3e", borderRadius: "10px"
            }}>
              <div style={{ color: "#777", fontSize: "10px", marginBottom: "8px" }}>YENİ AGENT</div>
              {[
                { key: "icon", placeholder: "İkon (emoji)" },
                { key: "name", placeholder: "Agent adı" },
                { key: "desc", placeholder: "Kısa açıklama" },
              ].map(f => (
                <input key={f.key} placeholder={f.placeholder} value={newAgent[f.key]}
                  onChange={e => setNewAgent(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{
                    width: "100%", background: "#0a0a18", border: "1px solid #222",
                    borderRadius: "6px", color: "#ccc", padding: "6px 8px", fontSize: "11px",
                    fontFamily: "inherit", marginBottom: "6px", outline: "none"
                  }} />
              ))}
              <textarea placeholder="Sistem promptu (bu agent ne yapacak?)"
                value={newAgent.systemPrompt}
                onChange={e => setNewAgent(p => ({ ...p, systemPrompt: e.target.value }))}
                rows={3}
                style={{
                  width: "100%", background: "#0a0a18", border: "1px solid #222",
                  borderRadius: "6px", color: "#ccc", padding: "6px 8px", fontSize: "11px",
                  fontFamily: "inherit", marginBottom: "8px", outline: "none", resize: "none"
                }} />
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={saveCustomAgent} style={{
                  flex: 1, background: "#1a3a2a", border: "1px solid #2a5a3a",
                  borderRadius: "6px", color: "#4ade80", fontSize: "11px", padding: "6px",
                  cursor: "pointer", fontFamily: "inherit"
                }}>Kaydet</button>
                <button onClick={() => setAdding(false)} style={{
                  flex: 1, background: "#1a1a1a", border: "1px solid #333",
                  borderRadius: "6px", color: "#666", fontSize: "11px", padding: "6px",
                  cursor: "pointer", fontFamily: "inherit"
                }}>İptal</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1a1a2a" }}>
          <div style={{ color: "#2a2a3a", fontSize: "9px", textAlign: "center" }}>
            CLAUDE AI PANEL • kalıcı
          </div>
        </div>
      </div>

      {activeAgent && <AgentChat agent={activeAgent} onClose={() => setActiveAgent(null)} />}
    </>
  );
}
