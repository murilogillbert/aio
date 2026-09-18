import { FormEvent, useEffect, useRef, useState } from "react";
import { Button, Card, EmptyState, Skeleton } from "./ui";
import { useConversations } from "../hooks/useConversations";
import { createConversation, listConversationMessages, sendConversationMessage } from "../services/api";
import type { ChatMessage } from "../services/api";

const POLL_MESSAGES_MS = 8000;

export function ChatPanel() {
  const { conversations, recipients, loading, reload } = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [startingWith, setStartingWith] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeId && conversations.length > 0) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    const load = () => {
      listConversationMessages(activeId).then((data) => {
        if (!cancelled) setMessages(data);
      });
    };
    load();
    const interval = setInterval(load, POLL_MESSAGES_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!activeId || !draft.trim()) return;
    setSending(true);
    try {
      const message = await sendConversationMessage(activeId, draft.trim());
      setMessages((current) => [...current, message]);
      setDraft("");
      void reload();
    } finally {
      setSending(false);
    }
  };

  const startConversation = async () => {
    if (!startingWith) return;
    const conversation = await createConversation([startingWith]);
    setStartingWith("");
    await reload();
    setActiveId(conversation.id);
  };

  const activeConversation = conversations.find((c) => c.id === activeId);

  if (loading) return <Skeleton className="h-96" />;

  return (
    <div className="grid h-[34rem] min-h-0 gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
        <div className="shrink-0">
          <h2 className="font-bold">Conversas</h2>
          {recipients.length > 0 ? (
            <div className="mt-3 flex gap-2">
              <select
                className="min-h-11 flex-1 rounded-lg border border-brown-mid/25 bg-surface px-2 text-sm text-brown-dark"
                value={startingWith}
                onChange={(event) => setStartingWith(event.target.value)}
              >
                <option value="">Iniciar conversa com...</option>
                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>{recipient.fullName}</option>
                ))}
              </select>
              <Button type="button" variant="secondary" onClick={startConversation} disabled={!startingWith}>
                Iniciar
              </Button>
            </div>
          ) : null}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid gap-2">
            {conversations.length === 0 ? (
              <p className="text-sm text-brown-mid">Nenhuma conversa ainda.</p>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setActiveId(conversation.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    conversation.id === activeId ? "border-primary bg-primary/10" : "border-brown-mid/15 hover:bg-bg-secondary"
                  }`}
                >
                  <p className="font-semibold text-brown-dark">{conversation.title}</p>
                  <p className="truncate text-xs text-brown-mid">{conversation.lastMessage?.body ?? "Sem mensagens"}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </Card>
      <Card className="flex h-full min-h-0 flex-col overflow-hidden">
        {!activeConversation ? (
          <EmptyState title="Selecione ou inicie uma conversa." />
        ) : (
          <>
            <h2 className="shrink-0 border-b border-brown-mid/10 pb-3 font-bold">{activeConversation.title}</h2>
            <div className="min-h-0 flex-1 overflow-y-auto py-3">
              {messages.length === 0 ? (
                <p className="text-sm text-brown-mid">Nenhuma mensagem ainda. Diga olá!</p>
              ) : (
                <div className="grid gap-2">
                  {messages.map((message) => (
                    <div key={message.id} className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${message.mine ? "ml-auto bg-primary text-white" : "bg-bg-secondary text-brown-dark"}`}>
                      {!message.mine ? <p className="mb-1 text-xs font-semibold opacity-70">{message.authorName}</p> : null}
                      <p>{message.body}</p>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
            <form className="flex shrink-0 gap-2 border-t border-brown-mid/10 pt-3" onSubmit={send}>
              <input
                className="min-h-11 flex-1 rounded-lg border border-brown-mid/25 bg-surface px-3 py-2 text-sm text-brown-dark shadow-sm transition duration-200 placeholder:text-brown-mid/70 focus:border-primary"
                placeholder="Escreva uma mensagem..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <Button loading={sending} disabled={!draft.trim()}>Enviar</Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
