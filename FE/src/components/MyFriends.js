import React from "react";
import { useEffect, useState } from "react";
import axios from "../services/axios";
import { ChatState } from "../Context/ChatProvider";
import { Button, useToast } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { Stack } from "@chakra-ui/react";
import ProfileModal from "./miscellaneous/ProfileModal";
import { getSenderFull } from "../config/ChatLogics";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../Context/AuthProvider";
export const MyFriends = () => {
  const toast = useToast();
  const {
    selectedChat,
    setSelectedChat,
    chats,
    setChats,
    friends,
    setFriends,
    friendRequest,
    setFriendRequest,
    requested,
    setRequested,
    setBlockUsers,
  } = ChatState();
  const { user } = useAuth();

  const listFriends = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const response = await axios.get(
        `/api/user/allfriend/${user._id}`,
        config
      );
      console.log("list friends", response.data);

      setRequested(response.data.requested);
      setFriends(response.data.friends);
      setFriendRequest(response.data.friendRequests);
      setBlockUsers(response.data.blockUsers);
      return response.data;
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  const handleAcceptFriends = async (requesterId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const payload = {
        ...user,
        friendId: requesterId,
      };
      await axios.post("/api/user/acceptfriend", payload, config);
      await fetchFriends();
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  const fetchFriends = async () => {
    const friendList = await listFriends();
    if (friendList) {
      setRequested(friendList.requested);
      setFriends(friendList.friends);
      setFriendRequest(friendList.friendRequests);
      setBlockUsers(friendList.blockUsers);
      console.log("Friends::", friendList.friends);
      console.log("FriendsRequest::", friendList.friendRequests);
      console.log("Requested::", friendList.requested);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleAcceptFriend = async () => {
    console.log("AcceptFriendRequest::");
  };
  const handleRejectFriend = async () => {
    console.log("RejectFriendRequest::");
  };
  return (
    <Box
      pb={3}
      px={3}
      bg="#e9ecef"
      fontSize={{ base: "28px", md: "30px" }}
      fontFamily="Work sans"
      d="flex"
      w="100%"
      justifyContent="space-between"
      alignItems="center"
      marginLeft={0}
      marginBottom={0}
      paddingTop={2}
      borderBottom="1.5px solid"
      borderColor="#d9dce8"
      minW="314px"
    >
      <Box
        d="flex"
        flexDir="column"
        p={2}
        bg="#e2e4e5"
        w="100%"
        h="match parent"
        overflowY="hidden"
      >
        {/* Nếu requested ko có thì render ra danh sách friends, nếu không thì
              render cả danh sách friend và friend request */}
        {friendRequest.length === 0 ? (
          <Stack overflowY="scroll">
            <Box borderBottom="0.1px solid black" fontSize="25px">
              Bạn bè
            </Box>
            {friends.map((friend) => {
              return (
                <Box
                  cursor="pointer"
                  // Nếu bấm chọn đoạn chat, nó sẽ đổi sang màu khác,
                  // chữ trong box hiển thị đoạn chat đó sẽ đổi màu đen
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={friend._id}
                  bg="white"
                  display={{ base: "none", md: "flex" }}
                  alignItems="center"
                  overflow="hidden"
                >
                  <ProfileModal
                    marginLeft="10px"
                    user={friend}
                    loggedUser={user}
                    fetchFriends={fetchFriends}
                  >
                    <Avatar
                      position="relative"
                      // mt="15px 15px 15px 15px"
                      w="40px"
                      h="40px"
                      cursor="pointer"
                      src={friend.pic}
                      border="2px solid #3a86ff"
                      marginRight="10px"
                    />
                  </ProfileModal>
                  <Box flex="1">
                    <h3>{friend.name}</h3>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Stack overflowY="scroll">
            {/* Thẻ tiêu đề Friends */}
            <Box borderBottom="0.1px solid black" fontSize="25px">
              Bạn bè
            </Box>
            {friends.map((friend) => {
              return (
                <Box
                  cursor="pointer"
                  // Nếu bấm chọn đoạn chat, nó sẽ đổi sang màu khác,
                  // chữ trong box hiển thị đoạn chat đó sẽ đổi màu đen
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={friend._id}
                  bg="white"
                  display={{ base: "none", md: "flex" }}
                  alignItems="center"
                  overflow="hidden"
                >
                  <ProfileModal
                    marginLeft="10px"
                    user={friend}
                    loggedUser={user}
                    fetchFriends={fetchFriends}
                  >
                    <Avatar
                      position="relative"
                      // mt="15px 15px 15px 15px"
                      w="40px"
                      h="40px"
                      cursor="pointer"
                      src={friend.pic}
                      border="2px solid #3a86ff"
                      marginRight="10px"
                    />
                  </ProfileModal>
                  <Box flex="1">
                    <h3>{friend.name}</h3>
                  </Box>
                </Box>
              );
            })}
            <Box borderBottom="0.1px solid black" fontSize="25px">
              Lời mời kết bạn
            </Box>
            {friendRequest.map((request) => {
              return (
                <Box
                  cursor="pointer"
                  // Nếu bấm chọn đoạn chat, nó sẽ đổi sang màu khác,
                  // chữ trong box hiển thị đoạn chat đó sẽ đổi màu đen
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={request._id}
                  bg="white"
                  display={{ base: "none", md: "flex" }}
                  alignItems="center"
                  overflow="hidden"
                >
                  <ProfileModal
                    marginLeft="10px"
                    user={request}
                    loggedUser={user}
                    fetchFriends={fetchFriends}
                  >
                    <Avatar
                      position="relative"
                      // mt="15px 15px 15px 15px"
                      w="40px"
                      h="40px"
                      cursor="pointer"
                      src={request.pic}
                      border="2px solid #3a86ff"
                      marginRight="10px"
                    />
                  </ProfileModal>
                  <Box flex="1">
                    <h3>{request.name}</h3>
                  </Box>
                  <Button
                    marginLeft="10px"
                    onClick={() => handleAcceptFriends(request._id)}
                    overflow="hidden"
                    bg="#00509d"
                    color="white"
                  >
                    <Box>
                      <FontAwesomeIcon
                        icon="fa-solid fa-circle-check"
                        size="lg"
                      />
                    </Box>
                  </Button>
                  <Button
                    onClick={() => handleRejectFriend(request._id)}
                    marginLeft="10px"
                    overflow="hidden"
                    bg="red.400"
                    color="white"
                  >
                    <Box>
                      <FontAwesomeIcon
                        icon="fa-solid fa-circle-xmark"
                        size="lg"
                      />
                    </Box>
                  </Button>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default MyFriends;
