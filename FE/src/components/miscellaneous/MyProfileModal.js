import { ViewIcon } from "@chakra-ui/icons";
import { Grid, GridItem } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
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
import { Box } from "@chakra-ui/layout";
import axios from "../../services/axios";
import { useToast } from "@chakra-ui/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChatState } from "../../Context/ChatProvider";
import { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthProvider";
import AWS from "aws-sdk";

// User model template from chakra ui
const MyProfileModal = ({ user, loggedUser, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setLoggedUser } = ChatState();
  const { setUser } = useAuth();
  const [isEditting, setIsEditting] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [university, setUniversity] = useState("");
  const [residence, setResidence] = useState("");
  const [workplace, setWorkplace] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const [pic, setPic] = useState();

  useEffect(() => {
    setName(user.name);
    setPhoneNumber(user?.phoneNumber);
    setUniversity(user?.university);
    setResidence(user?.residence);
    setWorkplace(user?.workplace);
    setPic(user.pic);
  }, [isEditting, user]);
  const toast = useToast();
  const edit = () => {
    setIsEditting(true);
  };
  const save = async () => {
    if (name == "" || pic == "") {
      toast({
        title: "Error Occured!",
        description: "Hãy nhập tên của bạn",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
    try {
      const payload = {
        _id: user._id,
        name: name,
        phoneNumber: phoneNumber,
        university: university,
        residence: residence,
        workplace: workplace,
        pic: pic,
      };
      const response = await axios.post(`/api/user/update`, payload);
      if (response?.data?.result == "okie") {
        setUser({ ...user, ...response.data.user });
        toast({
          title: "Successfully!",
          description: response?.data?.message,
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        close();
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
    setIsEditting(false);
  };
  const close = () => {
    setIsEditting(false);
    onClose();
  };
  // console.log("Đây nèeeeeeeeeeeeeeeeeeeeeeee", pic);
  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    // console.log(pics);

    // Upload profile pic
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      // const data = new FormData();
      // data.append("file", pics);
      // data.append("upload_preset", "chat-app");
      // data.append("cloud_name", "piyushproj");
      // fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", {
      //   method: "post",
      //   body: data,
      // })
      //   .then((res) => res.json())
      //   .then((data) => {
      //     setPic(data.url.toString());
      //     console.log(data.url.toString());
      //     setPicLoading(false);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //     setPicLoading(false);
      //   });

      const s3 = new AWS.S3({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_ACCESS_KEY_SECRET,
        region: process.env.REACT_APP_AWS_REGION,
      });
      const params = {
        Bucket: process.env.REACT_APP_AWS_S3_BUCKET,
        Key: `upload/${Date.now()}_${pics.name}`, // You can customize the S3 key based on your requirement
        Body: pics,
      };

      s3.upload(params, (err, data) => {
        if (err) {
          console.error("S3 upload error:", err);
          setPicLoading(false);
        } else {
          setPic(data.Location);

          console.log("S3 upload success:", data.Location);
          setPicLoading(false);
        }
      });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
  };
  // console.log("user", user)
  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal
        size={isEditting ? "xxl" : "xl"}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <ModalOverlay />
        <ModalContent h={isEditting ? "450px" : "350px"} w="80%">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            justifyContent="center"
            display={isEditting ? "" : "flex"}
            alignItems="center"
          >
            <Box>{isEditting ? "Edit profile" : user.name}</Box>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            d="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            {isEditting ? (
              <>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  <GridItem w="100%" colSpan={1}>
                    <FormControl id="first-name" isRequired>
                      <FormLabel>Name</FormLabel>
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem w="100%" colSpan={1}>
                    <FormControl id="phoneNumber">
                      <FormLabel>Phone number</FormLabel>
                      <Input
                        type="text"
                        placeholder="Enter your phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem w="100%" colSpan={1}>
                    <FormControl id="residence">
                      <FormLabel>Residence</FormLabel>
                      <Input
                        type="text"
                        placeholder="Enter your residence"
                        value={residence}
                        onChange={(e) => setResidence(e.target.value)}
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem w="100%" colSpan={1}>
                    <FormControl id="university">
                      <FormLabel>School</FormLabel>
                      <Input
                        type="text"
                        placeholder="Enter your school"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem w="100%" colSpan={1}>
                    <FormControl id="workplace">
                      <FormLabel>Workplace</FormLabel>
                      <Input
                        type="text"
                        value={workplace}
                        placeholder="Enter your workplace"
                        onChange={(e) => setWorkplace(e.target.value)}
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem w="100%" colSpan={1}>
                    <FormControl id="avatar">
                      <FormLabel>Avatar</FormLabel>
                      <Input
                        type="file"
                        p={1.5}
                        accept="image/*"
                        onChange={(e) => postDetails(e.target.files[0])}
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </>
            ) : (
              <>
                <Grid templateColumns="repeat(3, 1fr)" gap={3}>
                  <GridItem w="100%" colSpan={1}>
                    <Image
                      borderRadius="full"
                      boxSize="150px"
                      src={user.pic}
                      alt={user.name}
                    />
                  </GridItem>
                  <GridItem w="100%" colSpan={2}>
                    <Text
                      fontSize={{ base: "28px", md: "18px" }}
                      fontFamily="Work sans"
                    >
                      {user.phoneNumber ? `Phone: ${user.phoneNumber}` : ""}
                    </Text>
                    <Text
                      fontSize={{ base: "18px", md: "18px" }}
                      fontFamily="Work sans"
                    >
                      Email: {user.email}
                    </Text>
                    <Tooltip hasArrow label={user.residence}>
                      <Text
                        fontSize={{ base: "28px", md: "18px" }}
                        fontFamily="Work sans"
                        whiteSpace="nowrap" // Prevent text from wrapping
                        overflow="hidden" // Hide overflow content
                        textOverflow="ellipsis" // Show ellipsis (...) for overflow content
                      >
                        {user.residence ? `Residence: ${user.residence}` : ""}
                      </Text>
                    </Tooltip>
                    <Tooltip hasArrow label={user.university}>
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
                    <Tooltip hasArrow label={user.workplace}>
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
              </>
            )}
          </ModalBody>
          <ModalFooter>
            {isEditting ? (
              <Button marginRight={5} onClick={save}>
                Save
              </Button>
            ) : (
              <Button marginRight={5} onClick={edit}>
                Edit
              </Button>
            )}
            <Button onClick={close}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MyProfileModal;
