import { ChatList } from '@/components/chat-list'
import { MessageCircle } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-center gap-2 py-4 px-4">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground tracking-tight">Chat</h1>
      </header>
      <ChatList />
    </div>
  )
}
