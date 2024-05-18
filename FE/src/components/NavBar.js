import { Box, Text } from "@chakra-ui/layout";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import {
  React,
  useEffect,
  useState,
  useRef,
  createContext,
  useContext,
} from "react";
import axios from "../services/axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@chakra-ui/button";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";

import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../config/ChatLogics";
import { useDisclosure } from "@chakra-ui/hooks";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { Avatar } from "@chakra-ui/avatar";
import ProfileModal from "./miscellaneous/ProfileModal";
import MyProfileModal from "./miscellaneous/MyProfileModal";
import localStore from "../utils/localStorage";
import { useAuth } from "../Context/AuthProvider";
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { TiContacts } from "react-icons/ti";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FiSettings } from "react-icons/fi";
import { GiSmart } from "react-icons/gi";

import { BsChatSquareDots, BsChatSquareTextFill } from "react-icons/bs";
import { size } from "lodash";
import "./styles.css";
import { useHistory } from "react-router-dom";

const NavBar = () => {
  const history = useHistory();

  const handleClick = () => {
    history.push("/chats");
  };
  const {
    selectedChat,
    setSelectedChat,
    // user,
    notification,
    setNotification,
    chats,
    setChats,
    activeButton,
    setActiveButton,
  } = ChatState();
  const auth = useAuth();
  const { user } = auth;
  const menuButtonRef = useRef(null);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fetchAgain, setFetchAgain] = useState(false);

  const handleButtonClick = async (buttonId) => {
    await setActiveButton(buttonId);
    await console.log("active: ", buttonId);
  };

  const logoutHandler = async () => {
    auth.signout(() => {
      console.log("Log out");
    });
  };

  useEffect(() => {
    console.log("user", user);
  }, [user]);

  return (
    <Box
      id="nav-bar"
      display="flex"
      flexDirection="column"
      // d='block'
      fontSize={{ base: "20px", md: "18px" }}
      fontFamily="Work sans"
      justifyContent="space-between"
      // position="fixed"
      // top="0"
      // left="0"
      // bottom="0"
      width="90px"
      height="match-parent"
      // h="100vh"
      backgroundColor="#fff"
      // color="black"
      zIndex={999}
      borderRight="0.5px solid #d6d6cd"
    >
      <IconButton
        variant="ghost"
        width="60px"
        alignItems="center"
        marginBottom="10px"
        marginTop="10px"
        marginLeft="15px"
        transition="transform 0.5s"
        bg="transparent"
        border="none"
        icon={<BsChatSquareTextFill size="30px" color="#C8001A" />}
        onClick={handleClick}
      ></IconButton>
      <div>
        {/* Các biểu tượng tùy chọn */}
        <IconButton
          className="menu_list"
          variant="ghost"
          width="60px"
          alignItems="center"
          marginBottom="10px"
          marginTop="10px"
          marginLeft="15px"
          transition="transform 0.5s"
          bg="transparent"
          border="none"
          color="black"
          _hover={{
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            // backgroundColor: "00509d",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          }}
          _focus={{
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            // backgroundColor: "00509d",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          }}
          onClick={() => handleButtonClick(2)}
          {...(activeButton === 2 && {
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          })}
          icon={<IoChatboxEllipsesOutline size="30px" />}
        ></IconButton>
        <IconButton
          className="menu_list"
          // ref={menuButtonRef}
          variant="ghost"
          // onClick={onOpen}
          // bg="#a1a1c6"
          width="60px"
          alignItems="center"
          // paddingRight=""
          marginBottom="10px"
          marginTop="10px"
          marginLeft="15px"
          // marginRight="35px"
          transition="transform 0.5s"
          bg="transparent"
          border="none"
          color="black"
          _hover={{
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            // backgroundColor: "00509d",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          }}
          _focus={{
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            // backgroundColor: "00509d",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          }}
          onClick={() => handleButtonClick(3)}
          {...(activeButton === 3 && {
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          })}
          icon={<TiContacts size="30px" />}
        >
          {/* <FontAwesomeIcon icon="fa-solid fa-address-book" size="xl" /> */}
        </IconButton>

        {/* Button for rintone icon */}
        <IconButton
          className="menu_list"
          variant="ghost"
          width="60px"
          alignItems="center"
          marginBottom="10px"
          marginTop="10px"
          marginLeft="15px"
          transition="transform 0.5s"
          bg="transparent"
          border="none"
          color="black"
          _hover={{
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            // backgroundColor: "00509d",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          }}
          _focus={{
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            // backgroundColor: "00509d",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          }}
          onClick={() => handleButtonClick(4)}
          {...(activeButton === 4 && {
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          })}
        >
          <Menu>
            {/* Create the ring icon for notification */}
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              {/* <FontAwesomeIcon icon="fa-regular fa-bell" /> */}
              <IoIosNotificationsOutline size="30px" />
            </MenuButton>
            <MenuList pl={1} color="black">
              {!notification.length && "Không có tin nhắn mới"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `Tin nhắn mới từ ${notif.chat.chatName}`
                    : `Tin nhắn mới từ ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </IconButton>

        <IconButton
          // ref={menuButtonRef}
          variant="ghost"
          // onClick={onOpen}
          // bg="#a1a1c6"
          width="60px"
          alignItems="center"
          // paddingRight=""
          marginBottom="10px"
          marginTop="10px"
          marginLeft="15px"
          // marginRight="35px"
          transition="transform 0.5s"
          bg="transparent"
          border="none"
          color="black"
          _hover={{
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            // backgroundColor: "00509d",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          }}
          _focus={{
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            // backgroundColor: "00509d",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          }}
          onClick={() => handleButtonClick(5)}
          {...(activeButton === 5 && {
            width: "40px",
            marginLeft: "25px",
            marginRight: "15px",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "#1a78ff",
          })}
        >
          <GiSmart size="25px" />
        </IconButton>
      </div>
      <Menu>
        {/* Menu for avatar and view profile */}
        <MenuButton
          bg="#eaf4f4"
          // rightIcon={<ChevronDownIcon />
          color="black" // ban đầu white
          width="40px"
          marginTop="10px"
          marginLeft="25px"
          marginRight="25px"
          marginBottom="25px"
          transition="transform 0.5s"
          // bg="transparent"
          border="none"
          _hover={{
            width: "50px",
            height: "50px",
            marginLeft: "25px",
            marginRight: "15px",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "black", // ban đầu white
            borderRadius: "5px",
            marginBottom: "15px",
            marginTop: "10px",
            marginLeft: "20px",
            marginRight: "25px",
          }}
          _focus={{
            width: "50px",
            height: "50px",
            marginLeft: "25px",
            marginRight: "15px",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "black", // ban đầu white
            borderRadius: "5px",
            marginBottom: "15px",
            marginTop: "10px",
            marginLeft: "20px",
            marginRight: "25px",
          }}
          onClick={() => handleButtonClick(1)}
          {...(activeButton === 1 && {
            width: "50px",
            height: "50px",
            marginLeft: "25px",
            marginRight: "15px",
            bgGradient: "linear(to right, #e6f0ff,#e6f0ff)",
            transform: "scale(1.1)",
            color: "black", // ban đầu white
            borderRadius: "5px",
            marginBottom: "15px",
            marginTop: "10px",
            marginLeft: "20px",
            marginRight: "25px",
          })}
        >
          <Avatar
            cursor="pointer"
            name={user.name}
            src={user.pic}
            width="40px"
            height="40px"
            border="3px solid #3a86ff"
          />
        </MenuButton>
        {/* Menu for My profile or Logout */}
        <MenuList>
          {/* When click to my profile, display the MyProfileModal from miscellanous/ */}
          <MyProfileModal user={user} loggedUser={user}>
            <MenuItem color="black">Hồ sơ của tôi</MenuItem>{" "}
          </MyProfileModal>
          <MenuDivider />
          <MenuItem onClick={logoutHandler}>Đăng xuất</MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default NavBar;
