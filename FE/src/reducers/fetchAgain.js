const fetchAgainReducer = (state = false, action) => {
  switch (action.type) {
    case "FETCH_AGAIN":
      return !state;
    default:
      return state;
  }
};

export default fetchAgainReducer;
