import { useEffect, useState } from "react";
import { Bot, FileText, Lightbulb, Loader2, MessageSquareText, Send, Sparkles, X } from "lucide-react";
import { sendChatMessage } from "../../api/chatApi";
import ChatMarkdownRenderer from "./ChatMarkdownRenderer";

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

export default function ChatbotWidget({ proposal = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [activeProposalId, setActiveProposalId] = useState(proposal?.id);

  // Synchronize active proposal and welcome greeting
  useEffect(() => {
    const nextPropId = proposal?.id;
    if (nextPropId !== activeProposalId || messages.length === 0) {
      setActiveProposalId(nextPropId);
      setSessionId(null);

      const welcomeText = proposal
        ? `Hi! I am Jarvis, your faculty review assistant. I've loaded details for **"${proposal.title}"** (Submitted by ${proposal.student || "Student"}). Ask me about its summary, methodology, tech stack, difficulty, similarity risks, or requested revisions!`
        : "Hi, I am your AI assistant, Jarvis. Ask me about proposal reviews, project summaries, archive similarity, research gaps, or technology stacks.";

      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: "assistant",
          content: welcomeText,
        },
      ]);
    }
  }, [proposal, activeProposalId, messages.length]);

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
      const rawProposalId =
        typeof proposal?.rawId === "number"
          ? proposal.rawId
          : typeof proposal?.id === "number"
            ? proposal.id
            : null;

      const payload = {
        message: trimmedQuestion,
        session_id: sessionId,
        proposal_id: rawProposalId,
        proposal_context: proposal
          ? {
              id: proposal.id,
              title: proposal.title,
              student_name: proposal.student,
              department: proposal.dept,
              status: proposal.status,
              similarity_score: proposal.similarity,
              abstract: proposal.summary,
              problem_statement: proposal.problemStatement,
              objectives: proposal.objectives,
              methodology: proposal.methodology,
              technology_stack: proposal.technologyStack,
              similarity_notes: proposal.matches
                ? proposal.matches.map((m) => `${m.project} (${m.percent}% match)`).join("; ")
                : undefined,
            }
          : null,
      };

      const response = await sendChatMessage(payload);
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

  const starterPrompts = proposal
    ? [
        "Summarize problem statement & tech stack",
        "What are potential implementation risks?",
        "Suggest constructive feedback for review",
      ]
    : [
        "How can faculty review similarity reports?",
        "Recommend technology stacks for capstones",
        "What research gaps exist in past projects?",
      ];

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
      {isOpen && (
        <section className="flex h-[32rem] w-[min(calc(100vw-2.5rem),26rem)] flex-col overflow-hidden rounded-lg border border-[#d9e1dc] bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-[#e4ebe8] bg-[#17201d] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-md bg-[#15c7a8] text-[#071817]">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">Jarvis AI</p>
                <p className="text-xs font-semibold text-white/64">Faculty & Project Review Assistant</p>
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

          {proposal && (
            <div className="flex items-center gap-2 border-b border-[#e4ebe8] bg-[#eef7f4] px-3.5 py-2 text-xs font-semibold text-[#0b6b61]">
              <FileText className="size-3.5 shrink-0 text-[#0b6b61]" aria-hidden="true" />
              <span className="truncate">
                Connected: <strong className="font-bold">{proposal.title}</strong>
              </span>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#f6f8f7] p-3.5">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-md px-3.5 py-2.5 text-sm leading-6 ${
                      isUser
                        ? "bg-[#15c7a8] font-semibold text-[#071817]"
                        : "bg-white text-[#394842] shadow-sm ring-1 ring-[#e4ebe8]"
                    }`}
                  >
                    {isUser ? message.content : <ChatMarkdownRenderer content={message.content} />}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-[#52625d] shadow-sm ring-1 ring-[#e4ebe8]">
                  <Loader2 className="size-4 animate-spin text-[#0b6b61]" aria-hidden="true" />
                  Analyzing project details...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#e4ebe8] bg-white p-3 space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {starterPrompts.map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => askQuestion(promptText)}
                  disabled={isSending}
                  className="inline-flex items-center gap-1 rounded border border-[#cfdad5] bg-[#f6f8f7] px-2 py-1 text-[11px] font-medium text-[#394842] transition hover:border-[#15c7a8] hover:bg-[#eef7f4] hover:text-[#0b6b61] disabled:opacity-50"
                >
                  <Sparkles className="size-3 text-[#15c7a8]" aria-hidden="true" />
                  {promptText}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={proposal ? `Ask about ${proposal.title.slice(0, 24)}...` : "Ask about this project..."}
                className="h-10 min-w-0 flex-1 rounded-md border border-[#cfdad5] bg-[#fbfdfc] px-3 text-sm outline-none transition focus:border-[#15c7a8] focus:ring-2 focus:ring-[#15c7a8]/20"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="grid size-10 place-items-center rounded-md bg-[#15c7a8] text-[#071817] transition hover:bg-[#74ead7] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Send message"
              >
                {isSending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="size-4" aria-hidden="true" />
                )}
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative grid size-14 place-items-center rounded-full bg-[#15c7a8] text-[#071817] shadow-lg shadow-[#0b6b61]/20 transition hover:bg-[#74ead7] focus:outline-none focus:ring-4 focus:ring-[#15c7a8]/25"
        aria-label={isOpen ? "Hide AI chatbot" : "Open AI chatbot"}
      >
        {isOpen ? (
          <X className="size-6" aria-hidden="true" />
        ) : (
          <>
            <MessageSquareText className="size-6" aria-hidden="true" />
            {proposal && (
              <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-[#0b6b61] text-[9px] font-bold text-white ring-2 ring-white">
                !
              </span>
            )}
          </>
        )}
      </button>
    </div>
  );
}
