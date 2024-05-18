import { ViewIcon } from "@chakra-ui/icons";
import { Grid, GridItem } from '@chakra-ui/react'
import { Tooltip } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
} from "@chakra-ui/react";
import { Box,} from "@chakra-ui/layout";
import axios from "../../services/axios";
import { useToast } from "@chakra-ui/toast";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ChatState } from "../../Context/ChatProvider";

// User model template from chakra ui
const ProfileModal = ({ user, loggedUser, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { friends, setFriends, blockUsers, setBlockUsers, friendRequest, setFriendRequest, requested, setRequested } = ChatState();

  const listFriends = async () => {
      try {
          const config = {
            headers: {
              Authorization: `Bearer ${loggedUser.token}`,
            },
          };
          const response = await axios.get(
                `/api/user/allfriend/${loggedUser._id}`,
                config,
              );
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
      }
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

  let isFriend = friends.some(u => u._id === user._id)
  let haveFriendRequest = friendRequest.some(u => u._id === user._id)
  let isBlocked = blockUsers.some(x=>x._id==user._id)
  // console.log("isAFriend", isFriend)

  // console.log("loggedUser", loggedUser)
  const handleAddFriends = async (loggedUser) => {
    // console.log("user", user)
    // console.log("loggeduser", loggedUser)
    try {
      
      const payload = {
        ...loggedUser,
        friendId: user._id,
      }
      const { data } = await axios.post(
        "api/user/addfriend",
        payload,
        // config,
      );
      if(data.success=="done")
      {
        await fetchFriends();
      }
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
  }

  const handleUnfriend = async () => {
    try {
      const payload = {
        _id: loggedUser._id,
        friendId: user._id,
      }
      const {data} = await axios.post(
        "api/user/unfriend",
        payload,
      );
      console.log("data", data)
      if(data?.success=="done")
      {
        onClose();
        fetchFriends();
        toast({
          title: "Unfriend successfully!",
          description: data?.message,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
      else
      {
        toast({
          title: "Error Occured!",
          description: data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
      
  } catch (error) {
    console.log("error", error)
    toast({
      title: "Error Occured!",
      description: error.response?.data.message,
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    }
  }

  const blockUser = async () => {
    try {
      const payload = {
        ...loggedUser,
        friendId: user._id,
      }
      const {data} = await axios.post(
        "api/user/block",
        payload,
      );
      console.log("data", data)
      if(data?.success=="done")
      {
        onClose();
        fetchFriends();
        toast({
          title: "Block successfully!",
          description: data?.message,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
      else
      {
        toast({
          title: "Error Occured!",
          description: data?.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
  } catch (error) {
    toast({
      title: "Error Occured!",
      description: error.response?.data.message,
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
    }
  }
  
  console.log(requested, friendRequest, friends)
  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal size="xl" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="450px" 
          
          >
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            justifyContent="center"
            // display="flex"
            alignItems="center"
          >
            {isBlocked?<Box minH={50}/>:
            <>
            {user._id === loggedUser._id ? (
              null // Nếu user._id == loggedUser._id, không hiển thị gì cả
            ) : isFriend ? (
              <Box
                alignItems="center"
                fontSize={20}
                // flex="1"
                // bg="black"
                paddingRight={50}
                // marginRight={40}
              >
                <FontAwesomeIcon icon="fa-solid fa-user-check" size="2xl"/>
              </Box>
            ) : haveFriendRequest ? (
              <Box
                alignItems="center"
                fontSize={20}
                // flex="1"
                // bg="black"
                paddingRight={50}
                // marginRight={40}
              >
                <FontAwesomeIcon icon="fa-solid fa-square-arrow-up-right" />
              </Box>
            ) :  requested.some(u => u._id === user._id) ? (
              <Button marginRight={10} >
                Waiting for {user.name} to accept your friend request
              </Button>
            ) : friendRequest.some(u => u._id === user._id) ?
            (
              <Button marginRight={10} >
                 {user.name} Sent you a friend request
              </Button>
            ):(
              // Nút add friend trong profile modal
              <Button 
                marginRight={10}
                onClick={() => handleAddFriends(loggedUser)}
              >
                <FontAwesomeIcon icon="fa-solid fa-user-plus" />
              </Button>
            )}
            </>}
            <Box marginLeft={220}>{user.name}</Box>
            
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            d="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid templateColumns='repeat(3, 1fr)' gap={3}>
              <GridItem w='100%' colSpan={1}> 
                <Image
                  borderRadius="full"
                  boxSize="150px"
                  src={user.pic}
                  alt={user.name}
                />
              </GridItem>
              <GridItem w='100%' colSpan={2}>
              
              <Text
                fontSize={{ base: "28px", md: "18px" }}
                fontFamily="Work sans"
              >
                {user.phoneNumber?`Phone: ${user.phoneNumber}`:""} 
              </Text>
              <Text
                fontSize={{ base: "18px", md: "18px" }}
                fontFamily="Work sans"
              >
                Email: {user.email}
              </Text>
              <Tooltip hasArrow label={user.residence} >
                <Text
                  fontSize={{ base: "28px", md: "18px" }}
                  fontFamily="Work sans"
                  whiteSpace="nowrap" // Prevent text from wrapping
                  overflow="hidden" // Hide overflow content
                  textOverflow="ellipsis" // Show ellipsis (...) for overflow content
                >
                  {user.residence ? `Workplace: ${user.residence}` : ""}
                </Text>
              </Tooltip>
              <Tooltip hasArrow label={user.university} >
                <Text
                  fontSize={{ base: "28px", md: "18px" }}
                  fontFamily="Work sans"
                  whiteSpace="nowrap" // Prevent text from wrapping
                  overflow="hidden" // Hide overflow content
                  textOverflow="ellipsis" // Show ellipsis (...) for overflow content
                >
                  {user.university ? `School: ${user.university}` : ""}
                </Text>
              </Tooltip>
              <Tooltip hasArrow label={user.workplace} >
                <Text
                  fontSize={{ base: "28px", md: "18px" }}
                  fontFamily="Work sans"
                  whiteSpace="nowrap" // Prevent text from wrapping
                  overflow="hidden" // Hide overflow content
                  textOverflow="ellipsis" // Show ellipsis (...) for overflow content
                >
                  {user.workplace ? `Workplace: ${user.workplace}` : ""}
                </Text>
              </Tooltip>
              </GridItem>
              </Grid>
          </ModalBody>
          <ModalFooter>
            {user._id === loggedUser._id ? (
              null // Nếu user._id == loggedUser._id, không hiển thị gì cả
            ) : (
              <>
                <Button onClick={()=>blockUser()} bg="red.300" marginLeft= "10px" marginRight="10px">{isBlocked?"UnBlock":"Block"}</Button>
                {isFriend?
                <Button onClick={()=>handleUnfriend()} bg="red.100" marginRight= "10px">Unfriend</Button>
                  :null}
                </>
            )}
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
