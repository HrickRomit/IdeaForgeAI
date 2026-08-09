import { useState } from "react";
import { Bot, Loader2, MessageSquareText, Send, X } from "lucide-react";
import { sendChatMessage } from "../../api/chatApi";

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I am your AI assistant, Jarvis. Ask me about proposal reviews, project summaries, archive similarity, research gaps, or technology stacks.",
  },
];

function getErrorMessage(error) {
  if (!error.response) {
    return "Could not reach the backend server.";
  }

  if (error.response.status === 401 || error.response.status === 403) {
    return "Please login first so I can access the archive assistant.";
  }

  const detail = error.response.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }

  return detail || "Jarvis is temporarily unavailable. Please try again.";
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const askQuestion = async (question) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isSending) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmedQuestion,
      },
    ]);
    setInput("");
    setIsSending(true);

    try {
      const response = await sendChatMessage({
        message: trimmedQuestion,
        session_id: sessionId,
      });
      const data = response.data;

      setSessionId(data.session_id);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${data.assistant_message_id || Date.now()}`,
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: getErrorMessage(error),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askQuestion(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
      {isOpen && (
        <section className="flex h-[28rem] w-[min(calc(100vw-2.5rem),23rem)] flex-col overflow-hidden rounded-md border border-[#d9e1dc] bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-[#e4ebe8] bg-[#17201d] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-md bg-[#15c7a8] text-[#071817]">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold">Jarvis</p>
                <p className="text-xs font-semibold text-white/62">Faculty assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid size-8 place-items-center rounded-md text-white/76 transition hover:bg-white/10 hover:text-white"
              aria-label="Close AI chatbot"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f6f8f7] p-3">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-6 ${
                      isUser ? "bg-[#15c7a8] font-semibold text-[#071817]" : "bg-white text-[#394842] shadow-sm"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#52625d] shadow-sm">
                  <Loader2 className="size-4 animate-spin text-[#0b6b61]" aria-hidden="true" />
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[#e4ebe8] bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about this project..."
                className="h-10 min-w-0 flex-1 rounded-md border border-[#cfdad5] bg-[#fbfdfc] px-3 text-sm outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              />
              <button
                type="submit"
                disabled={isSending}
                className="grid size-10 place-items-center rounded-md bg-[#15c7a8] text-[#071817] transition hover:bg-[#74ead7] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                {isSending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
              </button>
            </div>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="grid size-14 place-items-center rounded-full bg-[#15c7a8] text-[#071817] shadow-lg shadow-[#0b6b61]/20 transition hover:bg-[#74ead7] focus:outline-none focus:ring-4 focus:ring-[#15c7a8]/25"
        aria-label={isOpen ? "Hide AI chatbot" : "Open AI chatbot"}
      >
        {isOpen ? <X className="size-6" aria-hidden="true" /> : <MessageSquareText className="size-6" aria-hidden="true" />}
      </button>
    </div>
  );
}
