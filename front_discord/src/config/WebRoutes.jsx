import { Route, Routes } from "react-router-dom";
import App from "../App";
import ChatPage from "../Components/ChatPage";

const WebRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/chat" element={<ChatPage/>} />
    </Routes>
  );
};

export default WebRoutes;
