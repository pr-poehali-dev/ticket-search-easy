import { useEffect, useState } from "react";
import { ticketsApi } from "@/hooks/useTickets";

const SEEN_KEY = "kompas_tickets_seen_at";
const POLL_MS = 60_000;

function getToken() {
  return localStorage.getItem("kompas_token");
}

export function markTicketsSeen() {
  localStorage.setItem(SEEN_KEY, new Date().toISOString());
  window.dispatchEvent(new Event("tickets-seen"));
}

export function useUnreadTickets() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!getToken()) {
        setHasUnread(false);
        return;
      }
      try {
        const tickets = await ticketsApi.list(undefined, "mine");
        const seenAt = localStorage.getItem(SEEN_KEY);
        const seenTs = seenAt ? new Date(seenAt).getTime() : 0;
        const unread = tickets.some(
          (t) =>
            t.messages_count > 1 &&
            new Date(t.updated_at).getTime() > seenTs,
        );
        if (!cancelled) setHasUnread(unread);
      } catch {
        if (!cancelled) setHasUnread(false);
      }
    }

    check();
    const id = setInterval(check, POLL_MS);
    const onSeen = () => setHasUnread(false);
    const onFocus = () => check();
    window.addEventListener("tickets-seen", onSeen);
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("tickets-seen", onSeen);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return hasUnread;
}
