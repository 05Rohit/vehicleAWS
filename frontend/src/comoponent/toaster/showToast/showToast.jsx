const showToast = (type, list, setList, message) => {
  let toastProperties = null
  switch (type) {
    case "success":
      toastProperties = {
        id: Date.now() + Math.random(),
        title: "Success",
        description: message,
        backgroundColor: "#136C34",
        type:type
      };
      break;
    case "danger":
      toastProperties = {
        id: Date.now() + Math.random(),
        title: "Error",
        description: message,
        backgroundColor: "#d9534f",
        type:type
      };
      break;
    default:
      return;
  }
  setList((prevList) => [...prevList, toastProperties]);
};

export default showToast;

