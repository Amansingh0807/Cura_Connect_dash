import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [replyData, setReplyData] = useState({}); // Stores reply text for each message
  const [replyFormVisible, setReplyFormVisible] = useState({}); // Manages form visibility
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:8080/api/message/getall",
          { withCredentials: true }
        );
        setMessages(data.messages);
      } catch (error) {
        console.log(error.response.data.message);
      }
    };
    fetchMessages();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  // Toggle reply form visibility
  const toggleReplyForm = (messageId) => {
    setReplyFormVisible((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // Handle reply input change
  const handleReplyChange = (e, messageId) => {
    setReplyData((prev) => ({
      ...prev,
      [messageId]: e.target.value,
    }));
  };

  // Submit reply
  const submitReply = async (messageId) => {
    if (!replyData[messageId]) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/message/reply",
        {
          messageId,
          reply: replyData[messageId],
        },
        { withCredentials: true }
      );

      toast.success("Reply sent successfully!");
      setReplyFormVisible((prev) => ({ ...prev, [messageId]: false }));
      setReplyData((prev) => ({ ...prev, [messageId]: "" }));

      // Refresh messages to show the new reply
      const { data } = await axios.get(
        "http://localhost:8080/api/message/getall",
        { withCredentials: true }
      );
      setMessages(data.messages);
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  return (
    <section className="page messages">
      <h1>MESSAGES</h1>
      <div className="banner">
        {messages && messages.length > 0 ? (
          messages.map((element) => (
            <div className="card" key={element._id}>
              <div className="details">
                <p>
                  <strong>First Name:</strong> <span>{element.firstName}</span>
                </p>
                <p>
                  <strong>Last Name:</strong> <span>{element.lastName}</span>
                </p>
                <p>
                  <strong>Email:</strong> <span>{element.email}</span>
                </p>
                <p>
                  <strong>Phone:</strong> <span>{element.phone}</span>
                </p>
                <p>
                  <strong>Message:</strong> <span>{element.message}</span>
                </p>
              </div>

              {/* Reply Section */}
              <div className="reply-section">
                <button
                  className="reply-btn"
                  onClick={() => toggleReplyForm(element._id)}
                >
                  Reply
                </button>

                {replyFormVisible[element._id] && (
                  <div className="reply-form">
                    <textarea
                      placeholder="Enter your reply..."
                      value={replyData[element._id] || ""}
                      onChange={(e) => handleReplyChange(e, element._id)}
                    />
                    <button
                      className="submit-reply-btn"
                      onClick={() => submitReply(element._id)}
                    >
                      Send Reply
                    </button>
                  </div>
                )}

                {/* Display existing replies */}
                {element.replies && element.replies.length > 0 && (
                  <div className="existing-replies">
                    <h4>Replies:</h4>
                    {element.replies.map((reply, index) => (
                      <p key={index} className="reply-text">
                        {reply}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <h1>No Messages!</h1>
        )}
      </div>
    </section>
  );
};

export default Messages;
