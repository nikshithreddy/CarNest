import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  TextField,
  IconButton,
  Paper,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import { useSelector } from "react-redux";
import {
  useGetConversationMutation,
} from "../services/apiService";

const WhatsAppChat = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const { access_token, profile } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [chats, setChats] = useState([])

  const [getConversation] = useGetConversationMutation();

  const messagesEndRef = useRef(null); // Ref for scrolling
  const wsRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    const chat = JSON.parse(conversation.chat)
    setChats(chat)
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return; // Prevent empty messages

    const tempMessage = {
      user: profile.email, // Sender email
      message: newMessage,
      timestamp: new Date().toISOString(),
      full_name: profile.name || "You",
      profile_picture: profile.picture || null,
      pending: true, // Local "sending" flag
    };

    // Add the message to the chat immediately
    setChats((prevChats) => [...prevChats, tempMessage]);
    setNewMessage(""); // Clear the input field

    // Send the message via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messagePayload = {
        message: newMessage,
        user_id: profile.id,
      };
      wsRef.current.send(JSON.stringify(messagePayload));
    } else {
      console.error("WebSocket is not connected.");
    }
  };

  const getConversationList = async () => {
    try {
      const res = await getConversation(access_token);
      if (res.error) return console.error(res.error.data.errors);
      setConversations(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (selectedConversation && selectedConversation.id) {
      // Initialize WebSocket
      const ws = new WebSocket(
        `wss://api.carnest.xyz/ws/booking/${selectedConversation?.id}/`
      );
      wsRef.current = ws;

      // Handle WebSocket events
      ws.onopen = () => {
        console.log("WebSocket connection established.");
      };

      ws.onmessage = (event) => {
        const incomingMessage = JSON.parse(event.data);
        console.log("Message received:", incomingMessage);

        setChats(incomingMessage.chat_history)
        scrollToBottom();
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
      };

      // Cleanup on unmount
      return () => {
        ws.close();
      };
    }
  }, [selectedConversation]); // Empty dependency array ensures this runs only on mount/unmount

  useEffect(() => {
    getConversationList();
  }, []); //eslint-disable-line

  useEffect(() => {
    // Scroll to bottom when selectedConversation changes
    scrollToBottom();
  }, [chats]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile && selectedConversation ? "column" : "row",
        height: "100vh",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Sidebar */}
      {(!isMobile || !selectedConversation) && (
        <Box
          sx={{
            width: isMobile ? "100%" : "30%",
            backgroundColor: "#fff",
            borderRight: "1px solid #ddd",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" sx={{ p: 2, fontWeight: "bold", color: "#FF6436" }}>
            Conversations
          </Typography>
          <List>
            {conversations.map((conversation, index) => (
              <ListItem
                button
                key={index}
                onClick={() => handleConversationClick(conversation)}
                sx={{
                  borderTop: index === 0 ? "1px solid #ddd" : "none",
                  borderBottom: "1px solid #ddd",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                <Avatar
                  src={profile.id === conversation.driver_id ? conversation?.passenger_pic : conversation?.driver_pic || ""}
                  alt={profile.id === conversation.driver_id ? conversation?.passenger_name : conversation?.driver_name}
                  sx={{ mr: 2 }}
                >
                  {profile.id === conversation.driver_id ? conversation?.passenger_name : conversation?.driver_name} {/* Fallback to initials */}
                </Avatar>
                <ListItemText primary={profile.id === conversation.driver_id ? conversation?.passenger_name : conversation?.driver_name} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Chat Panel */}
      {selectedConversation && (
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "16px",
              borderBottom: "1px solid #ddd",
              backgroundColor: "#fff",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            {isMobile && (
              <IconButton onClick={handleBackToList} sx={{ marginRight: 1 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6">{profile.id === selectedConversation.driver_id ? selectedConversation?.passenger_name : selectedConversation?.driver_name}</Typography>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              padding: 2,
              backgroundColor: "#f5f5f5",
              mb: isMobile ? 4 : 0,
            }}
          >
            {chats && chats?.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: message.user === profile.email ? "row-reverse" : "row", // Align based on sender
                  alignItems: "flex-start",
                  marginBottom: 2,
                }}
              >
                {/* Profile Picture */}
                <Avatar
                  src={message.profile_picture || ""}
                  alt={message.full_name}
                  sx={{
                    margin: message.user === profile.email ? "0 0 0 8px" : "0 8px 0 0", // Adjust margin based on alignment
                    bgcolor: message.profile_picture ? "transparent" : "#FF6436", // Fallback background color for initials
                    color: "#fff",
                  }}
                >
                  {!message.profile_picture && message.full_name?.[0]} {/* Fallback to initials */}
                </Avatar>

                {/* Message Bubble */}
                <Paper
                  sx={{
                    padding: 1.5,
                    backgroundColor: message.user === profile.email ? "#FF6436" : "#f1f1f1", // Different colors for sent/received
                    color: message.user === profile.email ? "#fff" : "#000",
                    maxWidth: "70%",
                    borderRadius: "15px",
                  }}
                >
                  {/* Message Content */}
                  <Typography>{message.message}</Typography>

                  {/* Timestamp */}
                  <Typography
                    variant="caption"
                    sx={{ display: "block", marginTop: 0.5, textAlign: message.user === profile.email ? "right" : "left" }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} /> {/* Scroll target */}
          </Box>

          {/* Input */}
          {/* Input */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              padding: "16px",
              borderTop: "1px solid #ddd",
              backgroundColor: "#fff",
              position: "sticky",
              bottom: isMobile ? 50 : 0,
              zIndex: 10,
            }}
          >
            <TextField
              placeholder="Type a message..."
              variant="outlined"
              fullWidth
              size="small"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // Prevents the default action of creating a new line
                  handleSendMessage();
                }
              }}
              sx={{ marginRight: 1 }}
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              sx={{ backgroundColor: "#FF6436", "&:hover": { backgroundColor: "#FF4500" } }}
            >
              <SendIcon sx={{ color: "#fff" }} />
            </IconButton>
          </Box>

        </Box>
      )}
    </Box>
  );
};

export default WhatsAppChat;
