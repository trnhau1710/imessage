import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllUsers } from "../services/userService";
import api from "../services/api.js";
import { getSocket } from "../services/socket.js";

function Chat() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    //Conversation & message
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    //Loading States
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    //Error state
    const [error, setError] = useState("");
    const [messageError, setMessageError] = useState("");

    //reference den phan tu tin nhan cuoi cung
    const messagesEndRef = useRef(null);

    //lay danh sach users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getAllUsers();
                setUsers(response.users);
            }
            catch (error) {
                console.log("Fetch user error: ", error.message);
                setError("Cannot load users.");
            }
            finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    //ham loc users theo username va theo email

    const filteredUsers = users.filter((item) => {
        const keyword = search.toLowerCase().trim();

        return (
            item.username.toLowerCase().includes(keyword) ||
            item.email.toLowerCase().includes(keyword)
        );
    });

    //Cuon xuong tin nhan cuoi cung
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);

    // Lang nghe tin nhan moi tu Socket.IO
    useEffect(() => {
        if (!conversation?._id) {
            return;
        }

        const socket = getSocket();

        if (!socket) {
            console.error("Socket instance not found.");
            return;
        }

        const conversationId = conversation._id;

        const joinRoom = () => {
            socket.emit("join_conversation", conversationId);
        };

        const handleNewMessage = (newMessage) => {
            const messageConversationId =
                newMessage.conversation?._id ||
                newMessage.conversation;

            if (
                messageConversationId?.toString() !==
                conversationId.toString()
            ) {
                return;
            }

            setMessages((previousMessages) => {
                const isDuplicate = previousMessages.some(
                    (message) => message._id === newMessage._id
                );

                if (isDuplicate) {
                    return previousMessages;
                }

                return [...previousMessages, newMessage];
            });
        };

        socket.on("connect", joinRoom);
        socket.on("new_message", handleNewMessage);

        if (socket.connected) {
            joinRoom();
        }

        return () => {
            socket.off("connect", joinRoom);
            socket.off("new_message", handleNewMessage);

            if (socket.connected) {
                socket.emit("leave_conversation", conversationId);
            }
        };

    }, [conversation?._id]);

    //chon user va tai cuoc tro chuyen
    const handleSelectUser = async (selected) => {
        //kiem tra xem nguoi dung duoc chon co phai la nguoi dung dang duoc chon truoc do hay khong
        //neu co thi dung ham
        if (selectedUser?._id === selected._id) {
            return;
        }

        setSelectedUser(selected);
        setConversation(null);
        setMessages([]);
        setMessageError("");
        setLoadingMessages(true);

        try {
            //tao hoac lay cuoc tro chuyen
            const conversationResponse = await api.post(`/conversations/${selected._id}`);

            const currentConversation = conversationResponse.data.conversation;

            setConversation(currentConversation);

            //Lay tin nhan cua cuoc tro chuyen
            const messageResponse = await api.get(`/messages/${currentConversation._id}`);

            setMessages(messageResponse.data.messages || []);
        }
        catch (error) {
            console.error("Load conversation error:", error);

            setMessageError(
                error.response?.data?.message ||
                "Cannot load conversation."
            );
        }
        finally {
            setLoadingMessages(false);
        }
    }

    //gui tin nhan
    const handleSendMessage = async (event) => {
        event.preventDefault();

        const content = newMessage.trim();

        if (!content || !conversation || sending) {
            return;
        }

        setSending(true);
        setMessageError("");

        try {
            const response = await api.post(`/messages/${conversation._id}`, { content });

            const sentMessage = response.data.data;

            setMessages((previousMessages) => {
                // Kiểm tra tin nhắn đã tồn tại chưa
                const isDuplicate = previousMessages.some(
                    (message) => message._id === sentMessage._id
                );

                if (isDuplicate) {
                    return previousMessages;
                }

                return [...previousMessages, sentMessage];
            });

            setNewMessage("");
        }
        catch (error) {
            console.error("Send message error:", error);

            setMessageError(
                error.response?.data?.message ||
                "Failed to send message. Please try again."
            );
        }
        finally {
            setSending(false);
        }
    }

    //gui bang cach nhan nut enter
    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage(event);
        }
    };

    // Ham dinh dang thoi gian
    const formatMessageTime = (date) => {
        return new Date(date).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    }


    return (
        <div className="chat-page">

            {/* HEADER */}
            <header className="chat-header">

                <div className="chat-brand">
                    <img
                        src="/images/imessage-logo.png"
                        alt="IMESSAGE Logo"
                        className="chat-logo-image"
                    />
                </div>

                <div className="chat-user-info">
                    <span>
                        Signed in as <strong>{user?.username}</strong>
                    </span>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

            </header>

            {/* MAIN CHAT LAYOUT */}
            <main className={`chat-layout ${selectedUser ? "is-chat-open" : ""}`}>

                {/* LEFT SIDEBAR */}
                <aside className="users-sidebar">

                    <div className="sidebar-heading">
                        <h2>IMessages</h2>
                        <p>Connect with your friends</p>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    {/* USER LIST */}
                    <div className="users-list">

                        {loading && (
                            <p className="chat-loading">
                                Loading users...
                            </p>
                        )}

                        {error && (
                            <p className="empty-users">
                                {error}
                            </p>
                        )}

                        {!loading &&
                            !error &&
                            filteredUsers.length === 0 && (
                                <p className="empty-users">
                                    No users found.
                                </p>
                            )
                        }

                        {!loading &&
                            !error &&
                            filteredUsers.map((item) => (

                                <button
                                    type="button"
                                    key={item._id}
                                    className={`user-item ${selectedUser?._id === item._id
                                        ? "active"
                                        : ""
                                        }`}
                                    onClick={() => handleSelectUser(item)}
                                >

                                    {/* AVATAR */}
                                    <div className="user-avatar">
                                        {item.username?.charAt(0)}
                                    </div>

                                    {/* USER INFORMATION */}
                                    <div className="user-details">

                                        <h3>{item.username}</h3>

                                        <p>{item.email}</p>

                                        <div className="user-status">
                                            <span
                                                className={`status-dot ${item.status === "online"
                                                    ? "online"
                                                    : ""
                                                    }`}
                                            />

                                            {item.status || "offline"}
                                        </div>

                                    </div>

                                </button>

                            ))
                        }

                    </div>

                </aside>

                {/* RIGHT CHAT CONTENT */}
                <section className="chat-content">

                    {!selectedUser ? (

                        /* EMPTY STATE */
                        <div className="chat-empty">

                            <div className="chat-empty-icon">
                                I
                            </div>

                            <h2>Welcome to IMESSAGE</h2>

                            <p>
                                Select a user from the left sidebar
                                to start a conversation.
                            </p>

                        </div>

                    ) : (

                        /* CONVERSATION */
                        <>

                            {/* CHAT HEADER */}
                            <div className="conversation-header">

                                {/* BACK BUTTON - MOBILE */}
                                <button
                                    type="button"
                                    className="back-to-users"
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setConversation(null);
                                        setMessages([]);
                                        setMessageError("");
                                    }}
                                >
                                    Back
                                </button>

                                <div className="user-avatar">
                                    {selectedUser.username?.charAt(0)}
                                </div>

                                <div className="conversation-user-info">
                                    <h3>{selectedUser.username}</h3>

                                    <p>
                                        {selectedUser.status || "offline"}
                                    </p>
                                </div>

                            </div>

                            {/* MESSAGE LIST */}
                            <div className="messages-container">

                                {loadingMessages && (
                                    <p className="message-placeholder">
                                        Loading messages...
                                    </p>
                                )}

                                {!loadingMessages &&
                                    messages.length === 0 && (
                                        <div className="message-placeholder">
                                            <h3>No messages yet</h3>

                                            <p>
                                                Start a conversation with{" "}
                                                {selectedUser.username}.
                                            </p>
                                        </div>
                                    )
                                }

                                {!loadingMessages &&
                                    messages.map((message) => {

                                        const senderId =
                                            message.sender?._id ||
                                            message.sender;

                                        const isOwnMessage =
                                            senderId?.toString() ===
                                            user?._id?.toString();

                                        return (
                                            <div
                                                key={message._id}
                                                className={`message-row ${isOwnMessage
                                                    ? "own-message"
                                                    : "received-message"
                                                    }`}
                                            >

                                                <div className="message-bubble">

                                                    <p>
                                                        {message.content}
                                                    </p>

                                                    <span className="message-time">
                                                        {formatMessageTime(
                                                            message.createdAt
                                                        )}
                                                    </span>

                                                </div>

                                            </div>
                                        );
                                    })
                                }

                                {/* AUTO SCROLL TARGET */}
                                <div ref={messagesEndRef} />

                            </div>

                            {/* MESSAGE ERROR */}
                            {messageError && (
                                <p className="message-error">
                                    {messageError}
                                </p>
                            )}

                            {/* MESSAGE INPUT */}
                            <form
                                className="message-input-area"
                                onSubmit={handleSendMessage}
                            >

                                <textarea
                                    placeholder="Write a message..."
                                    value={newMessage}
                                    onChange={(event) =>
                                        setNewMessage(event.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    disabled={
                                        loadingMessages || !conversation
                                    }
                                />

                                <button
                                    type="submit"
                                    className="send-button"
                                    disabled={
                                        !newMessage.trim() ||
                                        sending ||
                                        !conversation
                                    }
                                >
                                    {sending ? "Sending..." : "Send"}
                                </button>

                            </form>

                        </>

                    )}

                </section>

            </main>

        </div>
    );

}

export default Chat;