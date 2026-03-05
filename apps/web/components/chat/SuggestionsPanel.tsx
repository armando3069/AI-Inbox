import { Zap } from "lucide-react";

interface SuggestionsPanelProps {
  suggestions: string[];
  isLoading?: boolean;
  onSelect: (suggestion: string) => void;
}

export function SuggestionsPanel({ suggestions, isLoading, onSelect }: SuggestionsPanelProps) {
  return (
    <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-semibold text-slate-700">Răspunsuri Sugerate</span>
        {isLoading && (
          <span className="text-xs text-slate-400 ml-auto animate-pulse">Se generează...</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {isLoading
          ? [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-9 bg-white rounded-lg border border-slate-200 animate-pulse"
              />
            ))
          : suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(suggestion)}
                className="text-left p-2 bg-white hover:bg-purple-50 rounded-lg text-xs text-slate-700 border border-slate-200 hover:border-purple-300 transition-all"
              >
                {suggestion}
              </button>
            ))}
      </div>
    </div>
  );
}
