import { useCallback, useEffect, useRef, useState } from "react";
import { listConversations, listMessageRecipients } from "../services/api";
import type { ConversationSummary, MessageRecipient } from "../services/api";

const POLL_INTERVAL_MS = 15000;

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [recipients, setRecipients] = useState<MessageRecipient[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setConversations(await listConversations());
    } catch {
      // silencioso — o polling tenta de novo no próximo ciclo
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([listConversations(), listMessageRecipients()])
      .then(([conversationList, recipientList]) => {
        setConversations(conversationList);
        setRecipients(recipientList);
      })
      .finally(() => setLoading(false));
  }, []);

  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => {
    intervalRef.current = setInterval(reload, POLL_INTERVAL_MS);
    return () => clearInterval(intervalRef.current);
  }, [reload]);

  return { conversations, recipients, loading, reload };
}
