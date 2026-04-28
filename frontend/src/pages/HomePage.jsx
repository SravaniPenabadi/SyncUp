import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen" style={{ background: "#0f172a" }}>
      <div className="flex items-center justify-center pt-20 px-4">
        <div
          className="rounded-xl shadow-2xl w-full max-w-6xl h-[calc(100vh-8rem)] overflow-hidden"
          style={{
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex h-full overflow-hidden">
            <Sidebar />
            {selectedUser ? <ChatContainer /> : <NoChatSelected />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
