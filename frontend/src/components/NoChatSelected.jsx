import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div
      className="w-full flex flex-1 flex-col items-center justify-center p-10 sm:p-16"
      style={{
        background:
          "radial-gradient(circle at top, rgba(99,102,241,0.12), transparent 35%), #0f172a",
      }}
    >
      <div className="max-w-md text-center space-y-5">
        <div className="flex justify-center">
          <div
            className="no-chat-glow flex h-16 w-16 items-center justify-center rounded-2xl border"
            style={{
              background: "rgba(99,102,241,0.12)",
              borderColor: "rgba(99,102,241,0.24)",
            }}
          >
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-100">Welcome to SyncUp</h2>
        <p className="text-sm leading-6 text-slate-400 sm:text-base">
          Pick a friend from the sidebar to open your chat and watch the sync meter
          respond to the conversation.
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
