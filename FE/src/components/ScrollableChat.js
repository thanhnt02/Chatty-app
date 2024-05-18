import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import React, { forwardRef } from 'react';
import { useAuth } from "../Context/AuthProvider";
import defaultFileIcon from './default-file.png'; // Use a relative path


const ScrollableChat = forwardRef(({ messages}, ref) => {
  const { user } = useAuth();
  console.log("user",user)
  return (
    <ScrollableFeed ref={ref}>
      {messages &&
        messages.map((m, i) => (
          <div style={{ 
            display: "flex",
            justifyContent:
            m.sender?._id === user._id ? "flex-end" : "flex-start",
          }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender?.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1} //Avatar ở tin nhắn, khoảng cách
                  w="29px"
                  h="29px"
                  cursor="pointer"
                  name={m.sender?.name}
                  src={m.sender?.pic}
                />
              </Tooltip>
            )}
             {/* Kiểm tra tin nhắn  type=media*/}
             {m.type === "MEDIA" ? (
              m.content.split(";").map((fileUrl, index) => {
                const fileParts = fileUrl.split("/");
                const fileName = fileParts[fileParts.length - 1];
                // Tách để lấy extension của file
                const filePartExtensions = fileUrl.split(".");
                const fileExtension = filePartExtensions[filePartExtensions.length - 1].toLowerCase();
              
                if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
                  // Nếu là ảnh thì hiển thị
                  return (
                    <a key={index} href={fileUrl} target="_blank">
                      <img
                        src={fileUrl}
                        alt={`Image ${index + 1}`}
                        style={{
                          maxWidth: "150px",
                          maxHeight: "150px",
                        }}
                      />
                    </a>
                  );
                } else {
                  // Nếu không phải file ảnh thì nhấn vào để tải xuống
                  return (
                    <a key={index} target="_blank" href={fileUrl} title={fileName} download>
                      <img
                        src={defaultFileIcon}
                        alt={`File ${index + 1}`}
                        style={{
                          maxWidth: "50px",
                          maxHeight: "50px",
                        }}
                      />
                    </a>
                  );
                }
              })
            ) : (
              // Hiển thị tin nhắn type text
              <span
                style={{
                  backgroundColor: `${
                    m.sender?._id === user._id ? "#1a78ff" : "#d9dce8"
                  }`,
                  color: `${
                    m.sender?._id === user._id ? "white" : "black"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 3,
                  marginBottom: isSameUser(messages, m, i, user._id) ? 3 : 3,
                  borderRadius: "10px",
                  padding: "5px 15px",
                  maxWidth: "40%",
                }}
              >
                {m.content}
              </span>
            )}
          </div>
        ))}
    </ScrollableFeed>
  );
});

export default ScrollableChat;
