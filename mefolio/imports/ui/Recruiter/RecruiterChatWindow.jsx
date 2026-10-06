import { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SAMPLE_QUESTIONS = [
  "What are this candidate's strongest skills?",
  "What projects are most relevant to this role?",
  "What technologies has this candidate worked with?",
  "Can you summarise this candidate's experience?",
];

export function RecruiterChatWindow({ portfolioId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const nextMessageId = useRef(0);
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const conversationRef = useRef(null);

  useEffect(() => {
    // Open or close the dialog based on the isOpen state
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    // Keep the conversation scrolled to the bottom when new messages are added or when pendingCount changes
    const conversation = conversationRef.current;
    if (conversation) {
      conversation.scrollTop = conversation.scrollHeight;
    }
  }, [messages, pendingCount]);

  const handleSend = (text = message) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage) return;

    const userMessageId = nextMessageId.current++;
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "recruiter",
        text: trimmedMessage,
      },
    ]);
    setMessage("");
    setPendingCount((count) => count + 1);

    Meteor.call(
      "chat.send",
      { portfolioId, message: trimmedMessage },
      (error, result) => {
        setPendingCount((count) => count - 1);
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId.current++,
            role: "assistant",
            text: error ? error.reason || error.message : result.answer,
            isError: Boolean(error),
          },
        ]);
      },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-controls="recruiter-chat-dialog"
        aria-expanded={isOpen}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 border border-muted rounded-full bg- px-5 py-3 font-bold text-secondary shadow-lg hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Ask AI
      </button>

      <dialog
        ref={dialogRef}
        id="recruiter-chat-dialog"
        aria-labelledby="recruiter-chat-title"
        aria-describedby="recruiter-chat-description"
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            dialogRef.current?.close();
          }
        }}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg max-h-[85vh] overflow-visible border-0 bg-transparent p-0 backdrop:bg-black/50"
      >
        <section className="flex h-[85vh] max-h-[42rem] flex-col overflow-hidden rounded-2xl border border-line bg-surface-fill shadow-2xl">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-button p-2">
                <Sparkles className="h-5 w-5 text-accent1" aria-hidden="true" />
              </div>

              <div>
                <h2
                  id="recruiter-chat-title"
                  className="text-lg font-bold text-primary"
                >
                  AI Portfolio Twin
                </h2>
                <p
                  id="recruiter-chat-description"
                  className="text-sm text-muted"
                >
                  Ask questions about this candidate&apos;s experience, skills
                  and projects.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close AI Portfolio Twin chat"
              className="shrink-0 rounded-lg p-2 text-muted hover:bg-selected hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent1"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div
            ref={conversationRef}
            className="min-h-0 flex-1 overflow-y-auto p-5"
            role={messages.length > 0 ? "region" : undefined}
            aria-label={messages.length > 0 ? "Chat messages" : undefined}
            tabIndex={messages.length > 0 ? 0 : undefined}
          >
            {messages.length === 0 ? (
              <div>
                <p className="text-sm font-medium text-primary mb-3">
                  Try asking:
                </p>

                <div className="flex flex-wrap gap-2">
                  {SAMPLE_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSend(question)}
                      className="text-left text-sm px-3 py-2 border border-line rounded-lg text-primary hover:bg-selected transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div
                role="log"
                aria-label="Chat conversation"
                aria-live="polite"
                aria-relevant="additions text"
                className="space-y-3"
              >
                {messages.map((chatMessage) => (
                  <div
                    key={chatMessage.id}
                    className={`flex ${
                      chatMessage.role === "recruiter"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] border px-4 py-2 rounded-2xl ${
                        chatMessage.role === "recruiter"
                          ? "border-secondary bg-button text-secondary rounded-br-md"
                          : `bg-selected rounded-bl-md ${
                              chatMessage.isError
                                ? "border-red-700 text-red-700"
                                : "border-primary text-primary"
                            }`
                      }`}
                    >
                      {chatMessage.role === "recruiter" ? (
                        <p className="text-sm">{chatMessage.text}</p>
                      ) : (
                        <div className="text-sm [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1">
                          <ReactMarkdown>{chatMessage.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {pendingCount > 0 && (
                  <div role="status" className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md border border-muted bg-selected px-4 py-2 text-muted">
                      <p className="text-sm">Thinking…</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-line p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <label className="sr-only" htmlFor="recruiter-chat-input">
                Ask a question about this portfolio
              </label>
              <input
                ref={inputRef}
                id="recruiter-chat-input"
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about this candidate..."
                className="min-w-0 flex-1 rounded-xl border border-line bg-background px-4 py-3 text-primary placeholder:text-muted focus:outline focus:outline-2 focus:outline-accent1"
              />

              <button
                type="submit"
                disabled={!message.trim()}
                aria-label="Send message"
                className="inline-flex items-center justify-center rounded-xl bg-button px-4 py-3 text-secondary transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      </dialog>
    </>
  );
}

export default RecruiterChatWindow;
