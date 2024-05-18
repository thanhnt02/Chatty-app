import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "../services/axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@chakra-ui/button";
import { Avatar } from "@chakra-ui/avatar";
import { PhoneIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { Flex, Textarea, Stack } from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";
import { CloseButton } from "@chakra-ui/react";
import { useRef } from "react";
import uploadedFileUrls from "../services/uploadfile";
import { useAuth } from "../Context/AuthProvider";
import { socket, PeerConnection } from "../services/communication/index";
import { GrEmoji } from "react-icons/gr";
import data from "@emoji-mart/data";
import { FaRegFolder } from "react-icons/fa6";
import { BiPhoneCall } from "react-icons/bi";
import { LuVideo } from "react-icons/lu";

import { Configuration, OpenAIApi } from "openai";

import Picker from "@emoji-mart/react"; // Import emoji picker
import { useDispatch } from "react-redux";
import { fetchAgainn } from "../actions/fetchAgain";
// import "emoji-mart/css/emoji-mart.css"; // Import CSS của emoji picker
// const ENDPOINT = process.env.REACT_APP_API_URL;

var selectedChatCompare;

const configuration = new Configuration({
  organization: process.env.ORGINAZATION_OPENAI,
  apiKey: process.env.ORGINAZATION_OPENAI,
});
const openai = new OpenAIApi(configuration);

const SingleChat = ({ fetchAgain, setFetchAgain, startCall }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [seen, setSeen] = useState(false);
  const toast = useToast();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State để hiển thị/ẩn emoji picker
  // Handler khi bấm vào nút emoji picker
  const handleEmojiPickerButtonClick = () => {
    setShowEmojiPicker((prev) => !prev);
  };
  // Handler khi chọn emoji từ emoji picker
  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji.native); // Thêm emoji vào tin nhắn mới
  };

  const folderInputRef = useRef(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const {
    selectedChat,
    setSelectedChat,
    notification,
    setNotification,
    chats,
    aichat,
    setAiChat,
  } = ChatState();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { onOpen } = useDisclosure();
  const handleAvatarClick = () => {
    setIsModalOpen(true);
    onOpen();
  };
  const fetchMessages = async () => {
    if (!selectedChat) return;
    console.log("load fetchMessages");
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      console.log("message", data);
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const fetchDispatch = useDispatch();

  const sendMessage = async (event) => {
    if (event.key === "Enter" && (newMessage || selectedFiles.length > 0)) {
      socket.emit("stop typing", selectedChat._id);
      try {
        if (newMessage) {
          // gửi tin nhắn text
          const { data } = await axios.post("/api/message", {
            type: "TEXT",
            content: newMessage,
            chatId: selectedChat,
          });
          socket.emit("new message", data);
          setMessages([...messages, data]);
          setNewMessage("");
        }
        if (selectedFiles.length > 0) {
          // gửi tin nhắn media
          uploadedFileUrls(selectedFiles)
            .then(async (url) => {
              console.log("Uploaded file URLs:", url);
              const { data } = await axios.post("/api/message", {
                type: "MEDIA",
                content: url,
                chatId: selectedChat,
              });
              socket.emit("new message", data);
              setMessages([...messages, data]);
              setSelectedFiles([]);
            })
            .catch((error) => {
              // Xử lý lỗi ở đây nếu cần
              console.error("Upload error:", error);
            });
        }
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
    fetchDispatch(fetchAgainn());
  };

  useEffect(() => {
    socket.emit("setup", user);
    socket.emit("online", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    setLoading(true);
    selectedChatCompare = selectedChat;
    setFriendID(selectedChat?.users?.find((u) => u._id !== user._id)._id);
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

  const keyDownHandler = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      setShowEmojiPicker((prev) => {
        if (prev) prev = !prev;
      });
      e.preventDefault(); // Prevent Enter key from creating a new line
      // Handle sending the message or other actions here
    }
  };
  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  // xử lý upload file
  const inputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isInputVisible, setIsInputVisible] = useState(false);

  const handleFileSelect = (e) => {
    setIsInputVisible(false); // Ẩn input sau khi đã chọn file
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleRemoveFile = (fileIndex) => {
    const updatedFiles = selectedFiles.filter(
      (_, index) => index !== fileIndex
    );
    setSelectedFiles(updatedFiles);
  };

  const handleButtonClick = () => {
    if (!isInputVisible) {
      inputRef.current.click();
    }
  };
  // xử lý ctrl V
  const pasteHandler = (event) => {
    // Truy cập clipboardData
    const clipboardData = event.clipboardData || window.clipboardData;

    // Kiểm tra xem clipboardData có chứa dữ liệu file hoặc ảnh không
    if (clipboardData.files.length > 0) {
      // Xử lý dữ liệu file hoặc ảnh ở đây
      const files = clipboardData.files;
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };
  const scrollableFeedRef = useRef();
  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (scrollableFeedRef.current) {
      scrollableFeedRef.current.scrollToBottom();
    }
  };

  // call video + call
  const [friendID, setFriendID] = useState(null);

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    const config = { audio: true, video: video };
    return () => friendID && startCall(true, friendID, config);
  };

  console.log("single chat", selectedChat);
  console.log("Friend ID", friendID);

  const [AImessage, setAIMessage] = useState("");
  const [AIchats, setAIChats] = useState([]);
  const [AIisTyping, setAIIsTyping] = useState(false);

  const chat = async (e, message) => {
    e.preventDefault();

    if (!message) return;
    setAIIsTyping(true);
    // scrollTo(0, 1e10);

    let msgs = AIchats;
    msgs.push({ role: "user", content: message });
    setAIChats(msgs);

    setAIMessage("");

    await openai
      .createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Tôi là trợ lý AI của ứng dụng Chatty. Bạn cần giúp gì?",
          },
          ...AIchats,
        ],
      })
      .then((res) => {
        msgs.push(res.data.choices[0].message);
        setAIChats(msgs);
        setAIIsTyping(false);
        // scrollTo(0, 1e10);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  if (selectedChat && !aichat) {
    return (
      <>
        {selectedChat ? (
          <Flex flexDirection="column" h="100vh">
            <Flex
              fontSize={{ base: "20px", md: "22px" }}
              fontWeight="bold"
              pb={3}
              px={3}
              fontFamily="Work sans"
              justifyContent={{ base: "space-between" }}
              borderBottom="1.5px solid"
              borderColor="#e2e4e5"
              paddingLeft="15px"
            >
              {messages &&
                (!selectedChat.isGroupChat ? (
                  <>
                    {/* Avatar ở trên, hiển thị tên và avt người đang nhắn tin */}
                    <Box>
                      <ProfileModal
                        user={getSenderFull(user, selectedChat.users)}
                        loggedUser={user}
                        onClose={() => setIsModalOpen(false)}
                      >
                        <Avatar
                          mt="12px"
                          w="40px"
                          h="40px"
                          cursor="pointer"
                          src={getSenderFull(user, selectedChat.users).pic}
                          border="3px solid #3a86ff"
                          marginRight="10px"
                          onClick={handleAvatarClick}
                        />
                      </ProfileModal>
                    </Box>
                    {/* Box hiển thị tên người đang chat */}
                    <Box flex="1">
                      <Box paddingTop={2} fontSize={20}>
                        {getSender(user, selectedChat.users)}
                      </Box>
                      <Box fontSize={10}>Online</Box>
                    </Box>

                    {/* Các nút phía góc phải */}
                    <Box>
                      <Tooltip
                        label="Video call"
                        hasArrow
                        placement="bottom-end"
                      >
                        <Button
                          marginRight={5}
                          marginTop={4}
                          bg="transparent"
                          border="none"
                          onClick={callWithVideo(true)}
                        >
                          <LuVideo size="25px" />
                        </Button>
                      </Tooltip>

                      <Tooltip label="Call" hasArrow placement="bottom-end">
                        <Button
                          marginTop={4}
                          marginRight={5}
                          bg="transparent"
                          border="none"
                          onClick={callWithVideo(false)}
                        >
                          <BiPhoneCall size="25px" />
                        </Button>
                      </Tooltip>
                      {/* <Tooltip
                        label="Additional"
                        hasArrow
                        placement="bottom-end"
                      >
                        <Button bg="transparent" border="none">
                          <FontAwesomeIcon icon="fa-solid fa-rectangle-list" />
                        </Button>
                      </Tooltip> */}
                    </Box>
                  </>
                ) : (
                  <>
                    <Box
                      // w="60px"
                      // h="60px"
                      display="flex"
                      alignItems="center"
                    >
                      <Avatar
                        mt="12px"
                        w="40px"
                        h="40px"
                        cursor="pointer"
                        border="1px solid #3a86ff"
                        // marginRight="10px"
                        marginBottom="0px"
                        src={require("../avatar-group.png")}
                      />
                    </Box>
                    <Box
                      // paddingBottom="10px"
                      paddingLeft={2}
                      flex="1"
                      // alignItems="center"
                      display="flex"
                    >
                      <Box>
                        <Text paddingTop={2} fontSize={19}>
                          {selectedChat.chatName}
                        </Text>
                        <Text fontSize={11}>Member</Text>
                      </Box>
                      <Box marginTop={2}>
                        <UpdateGroupChatModal
                          fetchMessages={fetchMessages}
                          fetchAgain={fetchAgain}
                          setFetchA
                          gain={setFetchAgain}
                        />
                      </Box>
                    </Box>
                    {/* <Box marginRight={0} display="flex">
                      <Tooltip
                        label="Video call"
                        hasArrow
                        placement="bottom-end"
                      >
                        <Button marginRight={5} bg="transparent" border="none">
                          <FontAwesomeIcon icon="fa-solid fa-video" />
                        </Button>
                      </Tooltip>

                      <Tooltip label="Call" hasArrow placement="bottom-end">
                        <Button marginRight={5} bg="transparent" border="none">
                          <FontAwesomeIcon icon="fa-solid fa-phone" />
                        </Button>
                      </Tooltip>
                      <Tooltip
                        label="Additional"
                        hasArrow
                        placement="bottom-end"
                      >
                        <Button bg="transparent" border="none">
                          <FontAwesomeIcon icon="fa-solid fa-rectangle-list" />
                        </Button>
                      </Tooltip>
                    </Box> */}
                    {/* Nút Update group chat */}
                  </>
                ))}
            </Flex>
            <Box
              d="flex"
              flexDir="column"
              p={3}
              flex="1"
              overflowY="auto"
              bg="white"
            >
              {loading ? (
                <Spinner
                  size="xl"
                  w={20}
                  h={20}
                  alignSelf="center"
                  margin="auto"
                />
              ) : (
                <div className="messages">
                  <ScrollableChat messages={messages} ref={scrollableFeedRef} />
                </div>
              )}
            </Box>
            <Box pb={1}>
              <FormControl
                onKeyDown={sendMessage}
                id="first-name"
                isRequired
                mt={3}
              >
                {istyping ? (
                  <div>
                    <Lottie
                      options={defaultOptions}
                      // height={50}
                      width={70}
                      style={{ marginTop: 10, marginBottom: 10, marginLeft: 0 }}
                    />
                  </div>
                ) : (
                  <></>
                )}
                <Box>
                  <Flex alignItems="center" justifyContent="space-between">
                    <Box>
                      <Tooltip
                        label="Đính kèm file"
                        hasArrow
                        placement="bottom-end"
                      >
                        <Button
                          isDisabled={
                            selectedChat.isBlocked || selectedChat.Blocked
                          }
                          bg="transparent"
                          border="none"
                          onClick={handleButtonClick}
                        >
                          <AttachmentIcon />
                          <Input
                            type="file"
                            multiple
                            display={isInputVisible ? "block" : "none"}
                            ref={inputRef}
                            onChange={handleFileSelect}
                          />
                        </Button>
                      </Tooltip>
                    </Box>

                    <Box className="box-control">
                      <Tooltip label="Biểu cảm" hasArrow placement="bottom-end">
                        <Button
                          isDisabled={
                            selectedChat.isBlocked || selectedChat.Blocked
                          }
                          bg="transparent"
                          border="none"
                          data={data}
                          onClick={handleEmojiPickerButtonClick}
                        >
                          <GrEmoji size="20px" />
                        </Button>
                      </Tooltip>
                      {showEmojiPicker && (
                        <Picker
                          navPositon="top"
                          previewPosition="none"
                          onEmojiSelect={handleEmojiSelect}
                          style={{
                            position: "absolute",
                            top: "-300px",
                            right: "0",
                          }} // Đặt vị trí của emoji picker
                        />
                      )}
                    </Box>
                    <Textarea
                      placeholder={
                        selectedChat.isBlocked
                          ? selectedChat.Blocked
                            ? "You blocked them"
                            : "You are blocked"
                          : "Enter a message.."
                      }
                      rows={1}
                      marginRight="2"
                      value={newMessage}
                      onChange={typingHandler}
                      onKeyDown={keyDownHandler}
                      onPaste={pasteHandler}
                      resize="none"
                      isDisabled={
                        selectedChat.isBlocked || selectedChat.Blocked
                      }
                      overflowY="hidden" // Ẩn thanh cuộn dọc
                    />
                  </Flex>
                  <Flex direction="column">
                    <Stack
                      direction="row"
                      paddingTop={1}
                      paddingLeft={1}
                      spacing={2}
                      flex="1"
                    >
                      {selectedFiles.map((file, index) => (
                        <Box
                          key={index}
                          bg="gray.200"
                          p={2}
                          rounded="md"
                          position="relative"
                        >
                          {file.type.startsWith("image/") ? ( // Kiểm tra nếu là hình ảnh
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                            />
                          ) : (
                            file.name // Hiển thị tên tệp nếu không phải là ảnh
                          )}
                          <CloseButton
                            position="absolute"
                            top={0}
                            right={0}
                            mt={-2}
                            mr={-2}
                            onClick={() => handleRemoveFile(index)}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Flex>
                </Box>
              </FormControl>
            </Box>
          </Flex>
        ) : (
          // to get socket.io on same page
          <Box d="flex" alignItems="center" justifyContent="center" h="100%">
            <Text fontSize="3xl" pb={3} fontFamily="Work sans">
              Chọn bạn bè trong danh sách liên hệ
            </Text>
          </Box>
        )}
      </>
    );
  } else if (aichat) {
    return (
      <>
        <Flex flexDirection="column" h="100vh">
          <Flex
            fontSize={{ base: "20px", md: "22px" }}
            fontWeight="bold"
            pb={3}
            px={3}
            fontFamily="Work sans"
            justifyContent={{ base: "space-between" }}
            alignItems={{ base: "space-between" }}
            borderBottom="1.5px solid"
            borderColor="#e2e4e5"
            paddingLeft="15px"
          >
            <Box>
              <Avatar
                mt="12px"
                w="40px"
                h="40px"
                cursor="pointer"
                src={require("../aichat.png")}
                border="3px solid #3a86ff"
                marginRight="10px"
                onClick={handleAvatarClick}
              />
            </Box>
            <Box flex="1">
              <Box paddingTop={2} fontSize={20}>
                AI Chatbot
              </Box>
              <Box fontSize={10}>Online</Box>
            </Box>
          </Flex>
          <Box
            d="flex"
            flexDir="column"
            p={3}
            flex="1"
            overflowY="auto"
            bg="white"
          >
            <div className="messages">
              <section>
                {AIchats && AIchats.length
                  ? AIchats.map((chat, index) => (
                      <div
                        className={
                          chat.role === "user" ? "user_msg" : "assistant_msg"
                        }
                      >
                        <div className="ai_image"></div>
                        <p key={index} className="mess">
                          <span>{chat.content}</span>
                        </p>
                      </div>
                    ))
                  : ""}
              </section>

              <div className={AIisTyping ? "" : "hide"}>
                <p>
                  <i>{AIisTyping ? "Typing" : ""}</i>
                </p>
              </div>
            </div>
          </Box>
          <Box pb={1}>
            <form action="" onSubmit={(e) => chat(e, AImessage)}>
              <input
                type="text"
                name="message"
                className="input_form"
                value={AImessage}
                placeholder="Nhập tin nhắn với AI Chatbot"
                onChange={(e) => setAIMessage(e.target.value)}
              />
            </form>
          </Box>
        </Flex>
      </>
    );
  }
  return (
    <>
      {selectedChat ? (
        <Flex flexDirection="column" h="100vh">
          <Flex
            fontSize={{ base: "20px", md: "22px" }}
            fontWeight="bold"
            pb={3}
            px={3}
            fontFamily="Work sans"
            justifyContent={{ base: "space-between" }}
            borderBottom="1.5px solid"
            borderColor="#e2e4e5"
            paddingLeft="15px"
          >
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {/* Avatar ở trên, hiển thị tên và avt người đang nhắn tin */}
                  <Box>
                    <ProfileModal
                      user={getSenderFull(user, selectedChat.users)}
                      loggedUser={user}
                      onClose={() => setIsModalOpen(false)}
                    >
                      <Avatar
                        mt="12px"
                        w="40px"
                        h="40px"
                        cursor="pointer"
                        src={getSenderFull(user, selectedChat.users).pic}
                        border="3px solid #3a86ff"
                        marginRight="10px"
                        onClick={handleAvatarClick}
                      />
                    </ProfileModal>
                  </Box>
                  {/* Box hiển thị tên người đang chat */}
                  <Box flex="1">
                    <Box paddingTop={2} fontSize={20}>
                      {getSender(user, selectedChat.users)}
                    </Box>
                    <Box fontSize={10}>Online</Box>
                  </Box>

                  {/* Các nút phía góc phải */}
                  <Box>
                    <Tooltip label="Video call" hasArrow placement="bottom-end">
                      <Button
                        marginRight={5}
                        bg="transparent"
                        border="none"
                        onClick={callWithVideo(true)}
                      >
                        <FontAwesomeIcon icon="fa-solid fa-video" />
                      </Button>
                    </Tooltip>

                    <Tooltip label="Call" hasArrow placement="bottom-end">
                      <Button
                        marginRight={5}
                        bg="transparent"
                        border="none"
                        onClick={callWithVideo(false)}
                      >
                        <FontAwesomeIcon icon="fa-solid fa-phone" />
                      </Button>
                    </Tooltip>
                    <Tooltip label="Additional" hasArrow placement="bottom-end">
                      <Button bg="transparent" border="none">
                        <FontAwesomeIcon icon="fa-solid fa-rectangle-list" />
                      </Button>
                    </Tooltip>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    // w="60px"
                    // h="60px"
                    display="flex"
                    alignItems="center"
                  >
                    <Avatar
                      mt="12px"
                      w="40px"
                      h="40px"
                      cursor="pointer"
                      border="1px solid #3a86ff"
                      // marginRight="10px"
                      marginBottom="0px"
                    />
                  </Box>
                  <Box
                    // paddingBottom="10px"
                    paddingLeft={2}
                    flex="1"
                    // alignItems="center"
                    display="flex"
                  >
                    <Box>
                      <Text paddingTop={2} fontSize={19}>
                        {selectedChat.chatName.toUpperCase()}
                      </Text>
                      <Text fontSize={11}>Members</Text>
                    </Box>
                    <Box marginTop={2}>
                      <UpdateGroupChatModal
                        fetchMessages={fetchMessages}
                        fetchAgain={fetchAgain}
                        setFetchA
                        gain={setFetchAgain}
                      />
                    </Box>
                  </Box>
                  <Box marginRight={0} display="flex">
                    <Tooltip label="Video call" hasArrow placement="bottom-end">
                      <Button marginRight={5} bg="transparent" border="none">
                        <FontAwesomeIcon icon="fa-solid fa-video" />
                      </Button>
                    </Tooltip>

                    <Tooltip label="Call" hasArrow placement="bottom-end">
                      <Button marginRight={5} bg="transparent" border="none">
                        <FontAwesomeIcon icon="fa-solid fa-phone" />
                      </Button>
                    </Tooltip>
                    <Tooltip label="Additional" hasArrow placement="bottom-end">
                      <Button bg="transparent" border="none">
                        <FontAwesomeIcon icon="fa-solid fa-rectangle-list" />
                      </Button>
                    </Tooltip>
                  </Box>
                  {/* Nút Update group chat */}
                </>
              ))}
          </Flex>
          <Box
            d="flex"
            flexDir="column"
            p={3}
            flex="1"
            overflowY="auto"
            bg="white"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} ref={scrollableFeedRef} />
              </div>
            )}
          </Box>
          <Box pb={1}>
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginTop: 10, marginBottom: 10, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Box>
                <Flex alignItems="center" justifyContent="space-between">
                  <Box>
                    <Tooltip
                      label="Đính kèm file"
                      hasArrow
                      placement="bottom-end"
                    >
                      <Button
                        isDisabled={
                          selectedChat.isBlocked || selectedChat.Blocked
                        }
                        bg="transparent"
                        border="none"
                        onClick={handleButtonClick}
                      >
                        <AttachmentIcon />
                        <Input
                          type="file"
                          multiple
                          display={isInputVisible ? "block" : "none"}
                          ref={inputRef}
                          onChange={handleFileSelect}
                        />
                      </Button>
                    </Tooltip>
                  </Box>
                  {/* <Box>
                  <Tooltip
                    label="Đính kèm folder"
                    hasArrow
                    placement="bottom-end"
                  >
                    <Button
                      isDisabled={
                        selectedChat.isBlocked || selectedChat.Blocked
                      }
                      bg="transparent"
                      border="none"
                      onClick={handleFolderSelect}
                    >
                      <FaRegFolder />
                    </Button>
                  </Tooltip>
                  <input
                    type="file"
                    webkitdirectory
                    multiple
                    style={{ display: "none" }}
                    ref={folderInputRef}
                    onChange={handleFolderChange}
                  />
                </Box> */}
                  <Box className="box-control">
                    <Tooltip label="Biểu cảm" hasArrow placement="bottom-end">
                      <Button
                        isDisabled={
                          selectedChat.isBlocked || selectedChat.Blocked
                        }
                        bg="transparent"
                        border="none"
                        data={data}
                        onClick={handleEmojiPickerButtonClick}
                      >
                        <GrEmoji size="20px" />
                      </Button>
                    </Tooltip>
                    {showEmojiPicker && (
                      <Picker
                        navPositon="top"
                        previewPosition="none"
                        onEmojiSelect={handleEmojiSelect}
                        style={{
                          position: "absolute",
                          top: "-300px",
                          right: "0",
                        }} // Đặt vị trí của emoji picker
                      />
                    )}
                  </Box>
                  <Textarea
                    placeholder={
                      selectedChat.isBlocked
                        ? selectedChat.Blocked
                          ? "You blocked them"
                          : "You are blocked"
                        : "Enter a message.."
                    }
                    rows={1}
                    marginRight="2"
                    value={newMessage}
                    onChange={typingHandler}
                    onKeyDown={keyDownHandler}
                    onPaste={pasteHandler}
                    resize="none"
                    isDisabled={selectedChat.isBlocked || selectedChat.Blocked}
                    overflowY="hidden" // Ẩn thanh cuộn dọc
                  />
                </Flex>
                <Flex direction="column">
                  <Stack
                    direction="row"
                    paddingTop={1}
                    paddingLeft={1}
                    spacing={2}
                    flex="1"
                  >
                    {selectedFiles.map((file, index) => (
                      <Box
                        key={index}
                        bg="gray.200"
                        p={2}
                        rounded="md"
                        position="relative"
                      >
                        {file.type.startsWith("image/") ? ( // Kiểm tra nếu là hình ảnh
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                          />
                        ) : (
                          file.name // Hiển thị tên tệp nếu không phải là ảnh
                        )}
                        <CloseButton
                          position="absolute"
                          top={0}
                          right={0}
                          mt={-2}
                          mr={-2}
                          onClick={() => handleRemoveFile(index)}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Flex>
              </Box>
            </FormControl>
          </Box>
        </Flex>
      ) : (
        // to get socket.io on same page
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Chọn bạn bè trong danh sách liên hệ
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
