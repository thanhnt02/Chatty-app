export const isSameSenderMargin = (messages, m, i, userId) => {
  // console.log(i === messages.length - 1);

  if (
    i < messages.length - 1 &&
    messages[i + 1].sender?._id === m.sender?._id &&
    messages[i].sender?._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender?._id !== m.sender?._id &&
      messages[i].sender?._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender?._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender?._id !== m.sender?._id ||
      messages[i + 1].sender?._id === undefined) &&
    messages[i].sender?._id !== userId
  );
};
export const isSender = (chat, userId) => {
  return chat?.latestMessage?.sender?._id === userId;
};
export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender?._id !== userId &&
    messages[messages.length - 1].sender?._id
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender?._id === m.sender?._id;
};

export const getSender = (loggedUser, users) => {
  if(users?.length>1)
  {
    return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
  }
  if(users?.length === 1)  
  {
    return users[0].name;
  }
};

export const getSenderFull = (loggedUser, users) => {
  if(users?.length>1)
  {
    return users[0]?._id === loggedUser?._id ? users[1] : users[0];
  }
  if(users?.length === 1)  
  {
    return users[0];
  }
};

export const getLastMessage = (chat) => {
  if(chat?.latestMessage?.type === "MEDIA")
  {
    let numberOfMedia = chat?.latestMessage?.content.split(";").length;
    console.log("numberOfMedia",numberOfMedia)
    return ` Đã gửi ${numberOfMedia} file`;
  }
  return chat?.latestMessage?.content.length > 30
  ? chat?.latestMessage?.content.substring(0, 31) + "..."
  : chat?.latestMessage?.content
};
