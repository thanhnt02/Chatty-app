import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useState } from "react";
import axios from "../../services/axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";
import { IconButton } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import testImg from './background.png';
import { useAuth } from "../../../src/Context/AuthProvider";
import { useHistory } from "react-router-dom";
function SideDrawer() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    // user,
    notification,
    setNotification,
    chats,
    setChats,
    blockUsers,
  } = ChatState();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Hàm tìm kiếm user
  // Báo lỗi khi không nhập gì mà nhấn search
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Vui lòng nhập nội dung tìm kiếm",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      // Auth với API để có quyền get user
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      // k show những người bị block
      console.log(user);
      let newData = data.filter((u) => !u.blockUsers.includes(user._id));
      setSearchResult(newData);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  // Hàm truy cập vào đoạn chat với user đã tìm thấy
  // Hàm accessChat trong file chatController trong backend
  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      // Gửi post request đến chat api để tạo đoạn chat
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      // Set lại setLoading thành false khi không còn load
      // Set lại setSelectedChat truyền vào data để render ChatProvider
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Tooltip label="Tìm kiếm người dùng" hasArrow placement="bottom-end">
        <Button
          variant="ghost"
          onClick={onOpen}
          bg="#e6f0ff"
          width="250px"
          alignItems="center"
          // paddingRight=""
          marginLeft={0}
        >
          {/* import icon from font awesome icon */}
          {/* <i className="fa-duotone fa-house fa-beat"></i> */}
          {/* <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" beat /> */}

          <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
          <Text d={{ base: "none", md: "flex" }} px={4} marginLeft={0}>
            Tìm kiếm
          </Text>
        </Button>
      </Tooltip>

      {/* Hiện lên cừa sổ khi bấm vào search user */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Tìm kiếm</DrawerHeader>
          <DrawerBody>
            {/* Nhập vào text để search */}
            <Box d="flex" pb={2}>
              <Input
                placeholder="Tìm kiếm bằng tên hoặc email"
                mr={2}
                value={search}
                // onKeyDown={handleSearch}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              {/* <Button 
                onClick={handleSearch}
                onKeyDown={handleSearch}
              >Go</Button> */}
            </Box>
            {/* Nếu loading thì render ChatLoading, nếu không thì
            hiển thị danh sách user tìm thấy */}
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                  isBlocked={blockUsers.some((x) => x._id == user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      {/* Thanh navbar phía trái */}
    </>
  );
}

export default SideDrawer;
