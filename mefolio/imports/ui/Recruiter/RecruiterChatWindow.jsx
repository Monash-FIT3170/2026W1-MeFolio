import { useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { Send, Sparkles } from "lucide-react";

const SAMPLE_QUESTIONS = [
  "What are this candidate's strongest skills?",
  "What projects are most relevant to this role?",
  "What technologies has this candidate worked with?",
  "Can you summarise this candidate's experience?",
];

export function RecruiterChatWindow({ portfolioId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const nextMessageId = useRef(0);

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
    <div className="max-w-2xl mx-auto px-6 pb-12">
      <section className="bg-surface-fill border border-line rounded-2xl overflow-hidden">
        <div className="border-b border-line p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-selected">
              <Sparkles className="w-5 h-5 text-accent1" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-primary">
                AI Portfolio Twin
              </h2>
              <p className="text-sm text-muted">
                Ask questions about this candidate&apos;s experience, skills and
                projects.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
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
            <div className="space-y-3 max-h-72 overflow-y-auto">
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
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      chatMessage.role === "recruiter"
                        ? "bg-button text-secondary rounded-br-md"
                        : `bg-selected rounded-bl-md ${
                            chatMessage.isError
                              ? "text-red-700"
                              : "text-primary"
                          }`
                    }`}
                  >
                    <p className="text-sm">{chatMessage.text}</p>
                  </div>
                </div>
              ))}
              {pendingCount > 0 && (
                <div className="flex justify-start">
                  <div className="bg-selected text-muted px-4 py-2 rounded-2xl rounded-bl-md">
                    <p className="text-sm">Thinking…</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-line p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about this candidate..."
              className="flex-1 px-4 py-3 border border-line rounded-xl bg-background text-primary placeholder:text-muted focus:outline-none"
            />

            <button
              type="submit"
              disabled={!message.trim()}
              className="inline-flex items-center justify-center px-4 py-3 bg-button text-secondary rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default RecruiterChatWindow;
