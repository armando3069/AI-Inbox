"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { buildChannels } from "@/lib/chatUtils";
import { messagesService } from "@/services/messages/messages.service";
import { conversationsService } from "@/services/conversations/conversations.service";
import { aiAssistantQueryKeys } from "@/services/ai-assistant/ai-assistant.service";
import { subscribeToNewMessage } from "@/services/ws/ws";
import type { ContactInfoPatch } from "@/services/conversations/conversations.types";
import { notifyNewMessage } from "@/lib/notify";
import type { ConversationViewModel, Message } from "@/lib/types";
import { Sidebar } from "./Sidebar";
import { ConversationList } from "./ConversationList";
import { ChatArea } from "./ChatArea";

const SUGGESTIONS_STALE_MS = 10 * 60 * 1000; // 10 minutes — do not re-fetch if key unchanged
const SUGGESTIONS_GC_MS   = 30 * 60 * 1000; // 30 minutes — keep in cache across conversation switches

export function ChatLayout() {
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState<ConversationViewModel | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const { conversations, setConversations, isLoading: isLoadingConversations } = useConversations();

  // Auto-select a conversation passed via sessionStorage (e.g. from /contacts page)
  useEffect(() => {
    if (!conversations.length) return;
    const pending = sessionStorage.getItem("pendingConvId");
    if (!pending) return;
    sessionStorage.removeItem("pendingConvId");
    const conv = conversations.find((c) => c.id === Number(pending));
    if (conv) setSelectedConversation(conv);
  }, [conversations]);

  // ── Conversation list preview update ────────────────────────────────────

  const handlePreviewUpdate = useCallback(
    (conversationId: number, lastMessage: string, time: string) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, lastMessage, time } : c))
      );
    },
    [setConversations],
  );

  const { messages, isLoading: isLoadingMessages } = useMessages({
    selectedConversation,
    onPreviewUpdate: handlePreviewUpdate,
  });

  // ── Suggested replies ────────────────────────────────────────────────────
  //
  // Key = [conversationId, lastMessageId].
  // React Query re-fetches automatically when a new message arrives (lastMessageId
  // changes). Tab switches, re-renders, and window-focus events do NOT trigger
  // a re-fetch — the cached result is returned instead.

  const lastMessageId = messages[messages.length - 1]?.id ?? 0;
  const conversationId = selectedConversation?.id ?? 0;

  const {
    data: suggestionsData,
    isFetching: isLoadingSuggestions,
    refetch: refetchSuggestions,
  } = useQuery({
    ...aiAssistantQueryKeys.suggestedReplies(conversationId, lastMessageId),
    enabled: conversationId > 0 && lastMessageId > 0,
    staleTime: SUGGESTIONS_STALE_MS,
    gcTime: SUGGESTIONS_GC_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const suggestions = suggestionsData?.suggestions ?? [];

  // ── Global real-time subscription ────────────────────────────────────────
  // Notify for client messages in conversations other than the selected one.

  const selectedConvRef = useRef(selectedConversation);
  useEffect(() => { selectedConvRef.current = selectedConversation; });

  const conversationsRef = useRef(conversations);
  useEffect(() => { conversationsRef.current = conversations; });

  useEffect(() => {
    const unsub = subscribeToNewMessage((msg: Message) => {
      if (msg.sender_type !== "client" || !msg.text) return;
      if (selectedConvRef.current?.id === msg.conversation_id) return;

      const conv = conversationsRef.current.find((c) => c.id === msg.conversation_id);
      if (conv) {
        notifyNewMessage({
          platform: conv.platform,
          contactName: conv.contact,
          textPreview: msg.text,
        });
      }
    });
    return () => { unsub(); };
  }, []);

  // ── Channels & filtering ─────────────────────────────────────────────────

  const channels = buildChannels(conversations);

  const filteredConversations = conversations.filter((conv) => {
    if (selectedChannel === "all") return true;
    return conv.platform === selectedChannel;
  });

  // ── Contact info / lifecycle update ──────────────────────────────────────

  const handleUpdateConversation = useCallback(
    async (id: number, patch: ContactInfoPatch) => {
      const updated = await conversationsService.updateContactInfo(id, patch);
      const merge = (conv: typeof selectedConversation) => {
        if (!conv || conv.id !== id) return conv;
        return {
          ...conv,
          lifecycleStatus: updated.lifecycle_status ?? conv.lifecycleStatus,
          contactEmail: updated.contact_email ?? conv.contactEmail,
          contactPhone: updated.contact_phone ?? conv.contactPhone,
          contactCountry: updated.contact_country ?? conv.contactCountry,
          contactLanguage: updated.contact_language ?? conv.contactLanguage,
        };
      };
      setSelectedConversation((prev) => merge(prev));
      setConversations((prev) => prev.map((c) => (c.id === id ? (merge(c) ?? c) : c)));
    },
    [setConversations],
  );

  // ── Send ─────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    const text = messageInput.trim();
    setMessageInput("");
    try {
      await messagesService.sendReply(
        selectedConversation.id,
        text,
        selectedConversation.platform,
      );
    } catch (e) {
      console.error("sendReply error", e);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
      />
      <ConversationList
        conversations={filteredConversations}
        selectedConversation={selectedConversation}
        isLoading={isLoadingConversations}
        onSelectConversation={setSelectedConversation}
      />
      <ChatArea
        conversation={selectedConversation}
        messages={messages}
        isLoadingMessages={isLoadingMessages}
        messageInput={messageInput}
        suggestions={suggestions}
        isLoadingSuggestions={isLoadingSuggestions}
        onMessageInputChange={setMessageInput}
        onRefreshSuggestions={() => { refetchSuggestions(); }}
        onUpdateConversation={handleUpdateConversation}
        onSend={handleSend}
      />
    </div>
  );
}
