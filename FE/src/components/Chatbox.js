import { Box } from "@chakra-ui/layout";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";
import NavBar from "./NavBar";

const Chatbox = ({ fetchAgain, setFetchAgain, startCall }) => {
  // const { selectedChat } = ChatState();

  return (
    <Box 
      id="Chatbox"
      flexDir="row"
      // p={3}
      bg="white"
      flex="1"
      h="100vh"
      borderWidth="0.1px"
      borderColor="#e2e4e5"
    >
      {/* <NavBar /> */}
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} startCall={startCall} />
    </Box>
  );
};

export default Chatbox;
