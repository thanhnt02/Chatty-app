import { Box } from "@chakra-ui/layout";
import { useState, useContext, useEffect } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import AIChatBot from "../components/AIChatBot.js";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import NavBar from "../components/NavBar";
import MyFriends from "../components/MyFriends";
import { Flex, Spacer } from "@chakra-ui/react";
import { useAuth } from "../Context/AuthProvider";
import { socket, PeerConnection } from "../services/communication";
import _ from "lodash";
import CallModal from "../components/communication/CallModal";
import CallWindow from "../components/communication/CallWindow";
import axios from "../services/axios";
let pc = {};
let config = null;
const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const {
    selectedChat,
    setSelectedChat,
    notification,
    chats,
    setChats,
    activeButton,
    messages,
    setMessages,
  } = ChatState();
  const { user } = useAuth();
  const [stateCall, setStateCall] = useState({
    callWindow: "",
    callModal: "",
    callFrom: "",
    localSrc: null,
    peerSrc: null,
  });

  // const [page, setPage] = useState();
  // const setButtonId = (buttonId) => {
  //   setPage(buttonId);
  // }

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setButtonId(activeButton);
  //   };

  //   fetchData();
  // }, [activeButton]);

  // console.log("Values is: ", page);
  const setNewStateCall = (newState) => {
    setStateCall((prev) => {
      return { ...prev, ...newState };
    });
  };
  const [userCall, setUserCall] = useState("");
  useEffect(() => {
    socket
      .on("request", ({ from: callFrom, fromUser: name }) => {
        console.log("call from", name);
        setUserCall(name);
        setNewStateCall({ callModal: "active", callFrom: callFrom });
      })
      .on("call", (data) => {
        if (data.sdp) {
          console.log("PC", pc);
          pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === "offer") pc.createAnswer();
        } else pc.addIceCandidate(data.candidate);
      })
      .on("end", () => endCall(false));
    // In the new window
    window.onbeforeunload = () => {
      socket.emit("end", () => endCall(true));
    };
  }, []);
  const startCall = (isCaller, friendID, newConfig) => {
    config = newConfig;
    pc = new PeerConnection(friendID, user._id)
      .on("localStream", (src) => {
        const newState = { callWindow: "active", localSrc: src };
        if (!isCaller) newState.callModal = "";
        setNewStateCall(newState);
      })
      .on("peerStream", (src) => setNewStateCall({ peerSrc: src }))
      .start(isCaller, user._id);
  };

  const rejectCall = () => {
    const { callFrom } = stateCall;
    socket.emit("end", { to: callFrom });
    setNewStateCall({ callModal: "" });
  };

  const endCall = async (isStarter) => {
    if (_.isFunction(pc.stop)) {
      console.log(pc);
      if (isStarter) {
        // // gửi tin nhắn đánh dấu cuộc gọi
        // const { data } = await axios.post(
        //   "/api/message",
        //   {
        //     type: "TEXT",
        //     content: "Cuộc gọi",
        //     chatId: selectedChat,
        //   },
        // );
        // console.log("Người bắt đầu kết thúc!", data)
        // socket.emit("new message", data);
      } else {
        // // gửi tin nhắn đánh dấu cuộc gọi
        // const { data } = await axios.post(
        //   "/api/message",
        //   {
        //     type: "TEXT",
        //     content: "Cuộc gọi",
        //     chatId: selectedChat,
        //   },
        // );
        // socket.emit("new message", data);
        // console.log("Người được gọi kết thúc!", data)
      }
      pc.stop(isStarter);
      console.log("Call end");
    }
    pc = {};
    config = null;
    setNewStateCall({
      callWindow: "",
      callModal: "",
      localSrc: null,
      peerSrc: null,
    });
    console.log("pc after", pc, config, stateCall);
  };
  const { callFrom, callModal, callWindow, localSrc, peerSrc } = stateCall;
  console.log("log-call", callWindow, localSrc, peerSrc);
  return (
    <Flex w="100vw" h="100%">
      {user && <NavBar />}
      <Flex flex="1" id="box-right" w="100vw" h="100vh">
        {activeButton === 2 ? (
          <Box bg="white" overflow="hidden" id="my-chat" minW="314px">
            {user && <MyChats fetchAgain={fetchAgain} />}
          </Box>
        ) : activeButton === 3 ? (
          <Box bg="white" id="my-friends" minW="314px">
            {user && <MyFriends />}
            {/* {user && <MyChats fetchAgain={fetchAgain} />} */}
          </Box>
        ) : activeButton == 4 ? (
          <Box bg="white" minW="314px" p={2}>
            {notification.length == 0 && "Bạn không có thông báo mới"}
          </Box>
        ) : activeButton == 5 ? (
          <Box bg="white" overflow="hidden" id="my-chat" minW="314px">
            {user && <AIChatBot fetchAgain={fetchAgain} />}
          </Box>
        ) : (
          <Box bg="white" minW="314px"></Box>
        )}
        {user && (
          <>
            <Chatbox
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
              startCall={startCall}
            />
            {!_.isEmpty(config) && (
              <CallWindow
                status={callWindow}
                localSrc={localSrc}
                peerSrc={peerSrc}
                config={config}
                mediaDevice={pc.mediaDevice}
                endCall={endCall}
              />
            )}
            <CallModal
              status={callModal}
              startCall={startCall}
              rejectCall={rejectCall}
              callFrom={callFrom}
              userCall={userCall}
            />
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Chatpage;
