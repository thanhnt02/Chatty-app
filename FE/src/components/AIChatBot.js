import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "../services/axios";
import { useEffect, useState } from "react";
import {
  getSender,
  getLastMessage,
  getSenderFull,
  isSender,
} from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import testImg from "./background.png";
import SideDrawer from "./miscellaneous/SideDrawer";
import { Tooltip } from "@chakra-ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Avatar } from "@chakra-ui/avatar";
import APIs from "../api/APIs";
import { useAuth } from "../Context/AuthProvider";
const AIChatBot = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { chats, setChats, aichat, setAiChat } = ChatState();
  const { user } = useAuth();
  const toast = useToast();

  const fetchChats = async () => {
    console.log(user._id);
    try {
      // const config = {
      //   headers: {
      //     Authorization: `Bearer ${user.token}`,
      //   },
      // };

      const { data } = await axios.get(APIs.chat.list);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    console.log("get chat");
    // eslint-disable-next-line
  }, [fetchAgain]);

  //Nếu chọn 1 đoạn chat thì hiển thị ra khung chat(flex), nếu không sẽ ẩn đi(none)
  return (
    <>
      {/* Tạo Box Mychat, hiển thị các đoạn chat và nút tạo groupchat */}
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        flexDirection="row"
        w="100%"
        // justifyContent="space-between"
        // alignItems="center"
        marginLeft={0}
        marginBottom={0}
        paddingTop={2}
        borderBottom="1.5px solid "
        borderColor="#d9dce8"
        // bg="#cce1ff"
      >
        {/* {user && <SideDrawer />} */}
        <Text fontFamily="Work sans" textAlign="center" fontWeight="bold">
          Chatbot sử dụng AI
        </Text>
      </Box>
      {/* Tạo box hiển thị các đoạn chat, trong box này, có các box con cho từng đoạn chat */}
      <Box
        d="flex"
        flexDir="column"
        p={2}
        bg="white"
        w="100%"
        h="match parent"
        overflowY="hidden"
      >
        <Box
          onClick={() => {
            setAiChat(!aichat);
          }}
          cursor="pointer"
          // Nếu bấm chọn đoạn chat, nó sẽ đổi sang màu khác,#00509d
          // chữ trong box hiển thị đoạn chat đó sẽ đổi màu đen
          bg={aichat ? "#1a78ff" : "white"}
          color={aichat ? "white" : "black"}
          px={3}
          py={2}
          borderRadius="lg"
          display="flex"
          alignItems="center"

          // w="00px"
        >
          <Text>
            <Avatar
              position="relative"
              // mt="15px 15px 15px 15px"
              w="40px"
              h="40px"
              cursor="pointer"
              src={require("../aichat.png")}
              border="2px solid #3a86ff"
              marginRight="10px"
            />
          </Text>
          <Box fontWeight="bold">
            <Text fontFamily="Work sans" textAlign="center" fontWeight="bold">
              AI Chatbot
            </Text>
            {/* <Box>
              {chat.latestMessage && (
                <Text fontSize="xs" display="flex">
                  <Box flex={1}>
                    {chat.latestMessage.sender?.name}:
                    {" " + getLastMessage(chat)}
                  </Box>
                  <Box marginLeft="10">
                    {new Date(chat.latestMessage.createdAt).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Box>
                </Text>
              )} */}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AIChatBot;
