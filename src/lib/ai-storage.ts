import { AIMessage } from '@/types/ai';

export const AI_STORAGE_KEY = 'enmate_ai_chat_history_v1';
export const AI_UPDATE_EVENT = 'enmate_ai_chat_updated';

export const INITIAL_ASSISTANT_MESSAGE: AIMessage = {
  id: 'msg-welcome-root',
  role: 'assistant',
  content: "Hi 👋 I'm **EnMate AI**, your digital consultant.\n\nI can help you evaluate services, understand our packages (like our popular **₹8,000 Social Media Package**), estimate custom website costs, or plan a scalable growth funnel for your business.\n\nWhat are you looking to build or scale today?",
  timestamp: Date.now(),
  suggestions: [
    'What services do you offer?',
    'Tell me about the ₹8,000 Social Media Package',
    'How much does a custom website cost?',
    'How can EnMate scale my business?',
    'Talk to EnMate team'
  ]
};


/**
 * Safely retrieve conversation history from localStorage
 */
export function getStoredChatMessages(): AIMessage[] {
  if (typeof window === 'undefined') {
    return [INITIAL_ASSISTANT_MESSAGE];
  }

  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    if (!raw) return [INITIAL_ASSISTANT_MESSAGE];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    // Ignore parse errors and fallback
  }

  return [INITIAL_ASSISTANT_MESSAGE];
}

/**
 * Safely persist conversation history to localStorage and broadcast change event
 */
export function saveStoredChatMessages(messages: AIMessage[]): void {
  if (typeof window === 'undefined') return;

  try {
    // Keep maximum 40 messages to maintain speed & storage limits
    const sanitized = messages.slice(-40);
    localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent(AI_UPDATE_EVENT, { detail: sanitized }));
  } catch (e) {
    // Ignore storage quota errors
  }
}

/**
 * Reset conversation history
 */
export function clearStoredChatMessages(): AIMessage[] {
  const reset = [
    {
      ...INITIAL_ASSISTANT_MESSAGE,
      id: `msg-reset-${Date.now()}`,
      content: "New consultation started. What digital challenges or growth targets can I help you analyze?",
      timestamp: Date.now()
    }
  ];

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(reset));
      window.dispatchEvent(new CustomEvent(AI_UPDATE_EVENT, { detail: reset }));
    } catch (e) {}
  }

  return reset;
}
