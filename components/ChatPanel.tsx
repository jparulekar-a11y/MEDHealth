"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useSocket, useSocketEvent } from "@/lib/socket-client";
import type { MessagePayload } from "@/lib/socket-events";
import { cn, formatTime } from "@/lib/utils";

type Message = MessagePayload & {
  sender: { id?: string; name: string; role: string; avatar?: string | null };
};

type Props = {
  patientId: string | null;
  currentUserId: string;
  currentUserName: string;
};

export function ChatPanel({ patientId, currentUserId, currentUserName }: Props) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    if (!patientId) return;
    const res = await fetch(`/api/messages?patientId=${patientId}`);
    if (res.ok) setMessages(await res.json());
  }, [patientId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Poll when WebSockets aren't available (e.g. Vercel)
  useEffect(() => {
    if (!patientId || socket?.connected) return;
    const id = setInterval(fetchMessages, 3000);
    return () => clearInterval(id);
  }, [patientId, socket?.connected, fetchMessages]);

  useEffect(() => {
    if (!patientId || !socket) return;
    socket.emit("chat:join", patientId);
    return () => {
      socket.emit("chat:leave", patientId);
    };
  }, [patientId, socket]);

  useSocketEvent(
    "message:new",
    useCallback(
      (msg: MessagePayload) => {
        if (msg.patientId !== patientId) return;
        setMessages((prev) => [...prev, msg as Message]);
      },
      [patientId]
    )
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!patientId || !input.trim() || sending) return;

    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          senderId: currentUserId,
          content: input.trim(),
        }),
      });
      setInput("");
    } finally {
      setSending(false);
    }
  };

  if (!patientId) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
        <p className="text-sm text-slate-500">Select a patient to open care chat</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-80 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Care Chat</h2>
        <p className="text-xs text-slate-500">Messaging as {currentUserName}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  isOwn
                    ? "rounded-br-md bg-brand-600 text-white"
                    : "rounded-bl-md bg-slate-100 text-slate-900"
                )}
              >
                {!isOwn && (
                  <p className="mb-0.5 text-xs font-medium opacity-70">{msg.sender.name}</p>
                )}
                <p className="text-sm">{msg.content}</p>
                <p
                  className={cn(
                    "mt-1 text-right text-[10px]",
                    isOwn ? "text-brand-200" : "text-slate-400"
                  )}
                >
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-slate-100 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
