import type { ConversationViewModel, Message } from "@/lib/types";
import { ChatHeader } from "./ChatHeader";
import { MessagesList } from "./MessagesList";
import { MessageInput } from "./MessageInput";
import { EmptyState } from "./EmptyState";

interface ChatAreaProps {
  conversation: ConversationViewModel | null;
  messages: Message[];
  isLoadingMessages: boolean;
  messageInput: string;
  showSuggestions: boolean;
  suggestions: string[];
  isLoadingSuggestions: boolean;
  onMessageInputChange: (value: string) => void;
  onShowSuggestionsChange: (show: boolean) => void;
  onRefreshSuggestions: () => void;
  onSend: () => void;
}

export function ChatArea({
  conversation,
  messages,
  isLoadingMessages,
  messageInput,
  showSuggestions,
  suggestions,
  isLoadingSuggestions,
  onMessageInputChange,
  onShowSuggestionsChange,
  onRefreshSuggestions,
  onSend,
}: ChatAreaProps) {
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <ChatHeader conversation={conversation} />
      <MessagesList
        messages={messages}
        isLoading={isLoadingMessages}
        avatar={conversation.avatar}
      />
      <MessageInput
        value={messageInput}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        isLoadingSuggestions={isLoadingSuggestions}
        onValueChange={onMessageInputChange}
        onShowSuggestionsChange={onShowSuggestionsChange}
        onRefreshSuggestions={onRefreshSuggestions}
        onSend={onSend}
      />
    </div>
  );
}
