import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useRef } from "react";
import localStore from "../utils/localStorage";

// Create context
const ChatContext = createContext();

// Tạo một thành phần ChatProvider để cung cấp giá trị cho Context và quản lý trạng thái của ứng dụng chat
const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [activeButton, setActiveButton] = useState(2);
  const isMountedRef = useRef(true);
  const [friends, setFriends] = useState([]);
  const [friendRequest, setFriendRequest] = useState([]);
  const [requested, setRequested] = useState([]);
  const [messages, setMessages] = useState([]);
  const [blockUsers, setBlockUsers] = useState([]);
  const [aichat, setAiChat] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        // user,
        // setUser,
        blockUsers,
        setBlockUsers,
        notification,
        setNotification,
        chats,
        setChats,
        activeButton,
        setActiveButton,
        messages,
        setMessages,
        friends,
        setFriends,
        friendRequest,
        setFriendRequest,
        requested,
        setRequested,
        aichat,
        setAiChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
