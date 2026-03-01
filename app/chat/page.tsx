import Sidebar from "@/components/Sidebar";
import ChatBox from "@/components/ChatBox";

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
      <Sidebar />
      <main className="flex-1 lg:overflow-y-auto p-4 md:p-8 pt-20 lg:pt-8">
        <ChatBox />
      </main>
    </div>
  );
}
