import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";  // Added useNavigate
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();
  const navigate = useNavigate();  // Initialize navigate

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        await client.partialUpdateUser({
          id: authUser._id,
          set: {
            image: authUser.profilePic,
            name: authUser.fullName,
          },
        });

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  // Handle video call: send invite message + navigate to video call page
  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}/video`;

      channel.sendMessage({
        text: `📹 I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent!");

      navigate(`/call/${channel.id}/video`);
    }
  };

  // Handle audio call: send invite message + navigate to audio call page
  const handleAudioCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}/audio`;

      channel.sendMessage({
        text: `🎧 I've started an audio call. Join me here: ${callUrl}`,
      });

      toast.success("Audio call link sent!");

      navigate(`/call/${channel.id}/audio`);
    }
  };

  // Call buttons component
  const CallButtons = () => (
    <div className="absolute top-4 right-4 z-20 flex gap-2">
      <button
        onClick={handleVideoCall}
        className="bg-gradient-to-r from-blue-700 to-black text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
      >
        📹 Video Call
      </button>
     
    </div>
  );

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh] bg-base-200">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButtons />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
