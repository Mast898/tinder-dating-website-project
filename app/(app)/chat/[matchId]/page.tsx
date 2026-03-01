import { ChatRoom } from '@/components/chat-room'

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ matchId: string }>
}) {
  const { matchId } = await params

  return <ChatRoom matchId={matchId} />
}
