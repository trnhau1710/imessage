import { useEffect, useState } from "react";
//useState lưu trữ & quản lý dữ liệu thay đổi trên giao diện ==> thay đổi từ backend mà frontend cần cập nhật
//useEffect thực hiện các tác vụ phụ khi component được render hoặc khi dependencies thay đổi ==> thay đổi từ frontend cần phải thực hiện gọi API các kiểu
import api from "./services/api"; // gọi thằng api đã export từ file api.js


function App() {

  //đây là phần quan trọng nhất
  const [serverStatus, setServerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/health");

        setServerStatus(response.data);
      }
      catch (error) {
        console.error("API Error: ", error);
        setError("Cannot connect to Backend");
      }
      finally {
        setLoading(false);
      }
    };

    checkBackend();
  }, []);


  return (
    <div>
      <h1>Mini Messenger</h1>

      {loading && <p>Connecting to Backend...</p>}

      {serverStatus && (
        <div>
          <p>{serverStatus.message}</p>
          <p>Status: Connected</p>
        </div>
      )}

      {error && <p>{error}</p>}
    </div>
  );
}

export default App;