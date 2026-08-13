import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  BookOpenCheck,
  Database,
  Lightbulb,
  Loader2,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { sendChatMessage } from "../../api/chatApi";
import ChatMarkdownRenderer from "../../components/common/ChatMarkdownRenderer.jsx";

const starterPrompts = [
  "Suggest three unique final year project ideas using AI and web technologies.",
  "What research gaps can I explore from campus maintenance projects?",
  "Recommend a technology stack for an academic project archive system.",
  "How can I make my project proposal more unique than previous work?",
];

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I am your project chatbot. Ask me about project ideas, previous archive records, research gaps, technology stacks, or how to improve your proposal.",
    sources: [],
  },
];

function getErrorMessage(error) {
  if (!error.response) {
    return "Could not reach the backend server. Start FastAPI on http://localhost:8000, then try again.";
  }

  if (error.response.status === 401 || error.response.status === 403) {
    return "Please login first so the chatbot can access the archive assistant.";
  }

  const detail = error.response.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(" ");
  }

  return detail || "The AI assistant is temporarily unavailable. Please try again.";
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const latestSources = useMemo(() => {
    return [...messages].reverse().find((message) => message.sources?.length > 0)?.sources || [];
  }, [messages]);

  const askQuestion = async (question) => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuestion,
      sources: [],
    };

    setMessages((current) => [...current, userMessage]);
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
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: getErrorMessage(error),
          sources: [],
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
    <main className="min-h-screen bg-[#f5f7f4] text-[#17201d]">
      <div className="border-b border-[#d9e1dc] bg-white">
        <header className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b6b61]">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Home
              </a>
              <div className="mt-5 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-md bg-[#e4f7f2] text-[#0b6b61]">
                  <Bot className="size-6" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#0b6b61]">
                    Student AI Assistant
                  </p>
                  <h1 className="text-3xl font-bold tracking-normal sm:text-4xl">Ask Project Chatbot</h1>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/student"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-[#cfdad5] bg-white px-4 text-sm font-bold text-[#17201d] transition hover:border-[#15c7a8] hover:bg-[#f7fffc]"
              >
                <Lightbulb className="size-4" aria-hidden="true" />
                Get Project Ideas
              </a>
              <a
                href="/student/search"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#15c7a8] px-4 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7]"
              >
                <Search className="size-4" aria-hidden="true" />
                Search Archive
              </a>
            </div>
          </div>
        </header>
      </div>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
        <div className="flex min-h-[calc(100vh-13rem)] flex-col rounded-md border border-[#d9e1dc] bg-white shadow-sm">
          <div className="border-b border-[#e4ebe8] p-4">
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-5 text-[#0b6b61]" aria-hidden="true" />
              <h2 className="text-lg font-bold">Project Conversation</h2>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 bg-[#f9fbfa]">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
                  {isUser ? (
                    <div className="max-w-[80%] rounded-2xl bg-[#17201d] px-4 py-3 text-sm text-white shadow-sm">
                      {message.content}
                    </div>
                  ) : (
                    <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl border border-[#e4ebe8] bg-white p-4 shadow-sm">
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#0b6b61]">
                        <span className="grid size-6 place-items-center rounded-lg bg-[#e5f8f4]">
                          <Bot className="size-3.5 text-[#0b6b61]" />
                        </span>
                        IdeaForge AI
                      </div>
                      <ChatMarkdownRenderer content={message.content} sources={message.sources} />
                    </div>
                  )}
                </div>
              );
            })}

            {isSending ? (
              <div className="flex justify-start mb-4">
                <div className="flex items-center gap-2.5 rounded-2xl border border-[#e4ebe8] bg-white px-4 py-3 text-xs font-semibold text-[#52625d] shadow-sm">
                  <span className="grid size-6 place-items-center rounded-lg bg-[#e5f8f4]">
                    <Loader2 className="size-3.5 animate-spin text-[#0b6b61]" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>IdeaForge AI is analyzing archived projects...</span>
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-[#15c7a8] animate-ping" />
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[#e4ebe8] p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about ideas, research gaps, stacks, similarity, or archived projects"
                className="h-12 min-w-0 flex-1 rounded-md border border-[#cfdad5] bg-[#fbfdfc] px-3 text-sm outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              />
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#15c7a8] px-5 text-sm font-bold text-[#071817] transition hover:bg-[#74ead7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Send
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <section className="rounded-md border border-[#d9e1dc] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-[#0b6b61]" aria-hidden="true" />
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#394842]">Quick Questions</h2>
            </div>
            <div className="mt-4 space-y-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => askQuestion(prompt)}
                  disabled={isSending}
                  className="w-full rounded-md border border-[#d9e1dc] bg-[#f9fbfa] p-3 text-left text-sm font-semibold leading-6 text-[#394842] transition hover:border-[#15c7a8] hover:bg-[#f2fffb] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-[#d9e1dc] bg-[#17201d] p-4 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-[#74ead7]" aria-hidden="true" />
              <h2 className="text-sm font-bold">Archive Sources</h2>
            </div>
            <div className="mt-4 space-y-3">
              {latestSources.length > 0 ? (
                latestSources.map((source) => (
                  <div key={`${source.project_id}-${source.title}`} className="rounded-md bg-white/8 p-3">
                    <p className="text-sm font-bold text-white">{source.title}</p>
                    <p className="mt-1 font-['IBM_Plex_Mono'] text-xs text-white/58">{source.project_id}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-white/70">
                  Sources from archived projects will appear here after the assistant answers.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-md border border-[#d9e1dc] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="size-4 text-[#0b6b61]" aria-hidden="true" />
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#394842]">Chat Focus</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#52625d]">
              This page is for open project discussion with AI. Use the project idea page when you want to draft and
              organize a proposal.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
