const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");


const addFriend = asyncHandler(async (req, res) => {
    const { friendId, _id } = req.body;
  
    if (!friendId) {
      res.status(400);
      throw new Error("Friend ID is required");
    }
  
    //Tìm user đang đăng nhập trong DB
    const currentUser = await User.findById(_id);
  
    //Tìm trong danh sách bạn bè của user hiện tại
    const findFriend = currentUser.friends.includes(friendId);
    //Tìm user trong DB từ friendId
    const friend = await User.findById(friendId);
  
    console.log("User: ", currentUser)
    console.log("Friend: ", friend)
  
    //Nếu ko thấy user từ friendId thì báo user notfound
    if (!friend) {
      res.status(404);
      throw new Error("User not found");
    }
    //Nếu user ID đã tồn tại trong danh sách friend thì báo đã tồn tại
    if (findFriend) {
      res.status(404);
      throw new Error("Friend already exists");
    }
    // Kiểm tra xem đã gửi lời mời kết bạn cho friendId chưa
    const isRequested = currentUser.requested.includes(friendId);
    if (isRequested) {
      res.status(400);
      throw new Error('Friend request already sent');
    }
  
    // Kiểm tra xem đã nhận được lời mời kết bạn từ friendId chưa
    const isFriend = currentUser.friendRequests.includes(friendId);
    if (isFriend) {
      res.status(400);
      throw new Error('Friend request already received');
    }
  
    //Lưu lại friend Id vào danh sách friend
    //của user hiện tại
    // currentUser.friends.push(friendId);
    friend.friendRequests.push(_id); // Lưu id của người gửi vào friendRequest của người nhận
    currentUser.requested.push(friendId); // Lưu người nhận vào danh sách đã gửi lời mờ
  
    await currentUser.save();
    await friend.save();
    //Trả về tất cả danh sách sau khi gửi lời mời
    res.status(200).json({
      success:"done",
      message: "Sent friend request",
      friends: currentUser.friends,
      requested: currentUser.requested,
      friendRequests: currentUser.friendRequests,
    });
  });

const unFriend = asyncHandler(async (req, res) => {
    const { friendId, _id } = req.body;
    if(!friendId)  {
        res.status(400);
        throw new Error("Friend ID is required");
    }
    const currentUser = await User.findById(_id);
    
    //Nếu ko thấy user từ friendId thì báo user notfound
    if (!currentUser) {
      res.status(404);
      throw new Error("User not found");
    }

    //Tìm user trong DB từ friendId
    const friend = await User.findById(friendId);
    //Nếu ko thấy user từ friendId thì báo user notfound
    if (!friend) {
      res.status(404);
      throw new Error("Friend not found");
    }
    const isFriend = currentUser.friends.includes(friendId);
    if (isFriend) {
      //xóa friend Id ở danh sách friends
      //của user hiện tại
      currentUser.friends.remove(friendId);
      friend.friends.remove(_id); 
      await currentUser.save();
      await friend.save();

      //Trả về tất cả danh sách sau khi xóa bạn
      res.status(200).json({
        success:"done",
        message: "Unfriend successfully",
        friends: currentUser.friends,
        requested: currentUser.requested,
        friendRequests: currentUser.friendRequests,
      });
    }
    else
    {
      res.status(200).json({
        success:"failed",
        message: "The user is not your friend",
      });
    }
  });
const blockUser = asyncHandler(async (req, res) => {
    const { friendId, _id } = req.body;
    if(!friendId)  {
        res.status(400);
        throw new Error("User ID is required");
    }
    const currentUser = await User.findById(_id);
    
    //Nếu ko thấy user từ friendId thì báo user notfound
    if (!currentUser) {
      res.status(404);
      throw new Error("User not found");
    }

    //Tìm user trong DB từ friendId
    const friend = await User.findById(friendId);
    //Nếu ko thấy user từ friendId thì báo user notfound
    if (!friend) {
      res.status(404);
      throw new Error("User not found");
    }
    const isFriend = currentUser.friends.includes(friendId);
    if (isFriend) {
      //xóa friend Id ở danh sách friends
      currentUser.friends.remove(friendId);
      friend.friends.remove(_id);
      
    }
    if(currentUser.requested.includes(friendId))
    {
      currentUser.requested.remove(friendId);
      if(friend.friendRequests.includes(_id))
      {
        friend.friendRequests.remove(_id);
      }
    }
    if(currentUser.friendRequests.includes(friendId))
    {
      currentUser.friendRequests.remove(friendId);
      if(friend.requested.includes(_id))
      {
        friend.requested.remove(_id);
      }
    }

    currentUser.blockUsers.push(friendId);
    // friend.blockUsers.push(_id); 
    await currentUser.save();
    await friend.save();

    res.status(200).json({
      success:"done",
      message: "Block user successfully",
      friends: currentUser.friends,
      requested: currentUser.requested,
      friendRequests: currentUser.friendRequests,
      blockUsers: currentUser.blockUsers,
    });
});  
const allFriends = asyncHandler(async (req, res) => {
    //Tìm user đang đăng nhập hiện tại và thông tin bạn bè trong danh sách
    const currentUser = await User.findById(req.params.userId)
      .populate({
        path: "friends friendRequests requested blockUsers",
        select: "-password",
      });
  
    if (!currentUser) {
      res.status(404)
      throw new Error("Current user not found or being deleted");
    }
    console.log(currentUser);
    res.status(200).json(
      { 
        friends: currentUser.friends,
        friendRequests: currentUser.friendRequests,
        requested: currentUser.requested,
        blockUsers: currentUser.blockUsers,
      });
    // res.status(200).json(req.user.friends);
  })

const handleFriendRequest = asyncHandler(async (currentUser, friendId, userId, accept = false) => {

    // Check xem friendId có được truyền vào ko.
    if (!friendId) {
      throw new Error('Friend ID is required');
    }
    //Tìm user dựa trên friendId được truyền vào.
    const friend = await User.findById(friendId);
    
    //Nếu ko tìm thấy user dựa trên friendId thì báo notfound
    if (!friend) {
      throw new Error('User not found');
    }
    //Check xem đã có trong danh sách lời mời chưa
    const isFriend = currentUser.friendRequests.includes(friendId);
    if (!isFriend) {
      throw new Error('Friend request not found');
    }
    
    // Loại bỏ lời mời kết bạn ở cả user requested và user hiện tại
    currentUser.friendRequests = currentUser.friendRequests.filter((requestId) => requestId.toString() !== friendId);
    friend.requested = friend.requested.filter((requestId) => requestId.toString() !== userId);
  
    if (accept) {
      // Nếu chấp nhận lời mời, accept=true, thêm friendId vào danh sách bạn bè của cả hai người dùng
      currentUser.friends.push(friendId);
      friend.friends.push(userId);
    }
  
    // Lưu cập nhật vào cả hai người dùng
    await Promise.all([currentUser.save(), friend.save()]);
  
    if (accept) {
      return {
        message: 'Friend request accepted successfully',
        friends: currentUser.friends,
        friendRequests: currentUser.friendRequests,
        accepted: "true",
      };
    } else {
      return {
        message: 'Friend request rejected successfully',
        friendRequests: currentUser.friendRequests,
        friends: currentUser.friends,
        accepted: "false",
      };
    }
  });
  
const rejectFriendRequest = asyncHandler(async (req, res) => {
    const { friendId, _id } = req.body;
    const currentUser = await User.findById(_id);
  
    // Gọi hàm handleFriendRequest để từ chối lời mời kết bạn
    const result = await handleFriendRequest(currentUser, friendId, _id);
  
    res.status(200).json(result);
  });
  
const acceptFriendRequest = asyncHandler(async (req, res) => {
    const { friendId, _id } = req.body;
    const currentUser = await User.findById(_id);
  
    // Gọi hàm handleFriendRequest để chấp nhận lời mời kết bạn
    const result = await handleFriendRequest(currentUser, friendId, _id, true);
  
    res.status(200).json(result);
  });
  
  
  

module.exports = { addFriend, unFriend, allFriends,rejectFriendRequest, acceptFriendRequest, blockUser };