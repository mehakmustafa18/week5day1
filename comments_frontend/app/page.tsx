"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "./context/au_context";
import { useSocket } from "./hooks/useSocket";
import { Comment } from "./types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { BellIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const { user, token, logout, isLoading } = useAuth();
  const router = useRouter();
  const socket = useSocket(process.env.NEXT_PUBLIC_SOCKET_URL!);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [typingUsers, setTypingUsers] = useState<
    { userId: number; username: string }[]
  >([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processedCommentIds = useRef<Set<number>>(new Set());

  const [unreadComments, setUnreadComments] = useState<Comment[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`unreadComments_${user.id}`);
      if (saved) {
        try {
          setUnreadComments(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`unreadComments_${user.id}`, JSON.stringify(unreadComments));
    }
  }, [unreadComments, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    }
  }, [token, router, isLoading]);

  useEffect(() => {
    if (!socket) return;

    let isActive = true; // prevent state updates after unmount

    const onInitialComments = (initialComments: Comment[]) => {
      if (!isActive) return;
      processedCommentIds.current.clear();
      initialComments.forEach((c) => processedCommentIds.current.add(c.id));
      setComments(initialComments);
    };

    const onNewComment = (comment: Comment) => {
      if (!isActive) return;

      if (processedCommentIds.current.has(comment.id)) {
        return;
      }
      processedCommentIds.current.add(comment.id);

      // Add to comments list
      setComments((prev) => [comment, ...prev]);

      // Add to unread if from another user
      if (comment.user.id !== user?.id) {
        setUnreadComments((prev) => {
          if (prev.some((c) => c.id === comment.id)) return prev;
          return [comment, ...prev];
        });
        toast.info(`${comment.user.username}: ${comment.text}`);
      }
    };

    const onUserTyping = (data: { userId: number; username: string }) => {
      if (!isActive) return;
      setTypingUsers((prev) => {
        if (!prev.some((u) => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      }, 3000);
    };

    const onUserStoppedTyping = (data: { userId: number }) => {
      if (!isActive) return;
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    };

    socket.on("initial_comments", onInitialComments);
    socket.on("new_comment", onNewComment);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stopped_typing", onUserStoppedTyping);

    return () => {
      isActive = false;
      socket.off("initial_comments", onInitialComments);
      socket.off("new_comment", onNewComment);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stopped_typing", onUserStoppedTyping);
    };
  }, [socket, user]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
    if (socket) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("typing", { isTyping: true });
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", { isTyping: false });
      }, 1000);
    }
  };
  const isSubmitting = useRef(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting.current) {
      return;
    }
    isSubmitting.current = true;
    if (!newComment.trim() || !socket) {
      isSubmitting.current = false;
      return;
    }
    socket.emit("new_comment", { text: newComment });
    setNewComment("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("typing", { isTyping: false });
    setTimeout(() => {
      isSubmitting.current = false;
    }, 500);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const markAllAsRead = () => {
    setUnreadComments([]);
    setShowNotifications(false);
  };

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Real-time Comments</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user.username}</span>
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1 rounded-full hover:bg-gray-100"
              >
                <BellIcon className="h-6 w-6 text-gray-600" />
                {unreadComments.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadComments.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-10">
                  <div className="p-2 border-b flex justify-between items-center">
                    <span className="font-semibold">Notifications</span>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {unreadComments.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No new notifications
                      </div>
                    ) : (
                      unreadComments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 border-b hover:bg-gray-50"
                        >
                          <div className="font-semibold">
                            {comment.user.username}
                          </div>
                          <div className="text-sm text-gray-600">
                            {comment.text}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(comment.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={handleCommentChange}
            placeholder="Write a comment..."
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Post
          </button>
        </form>

        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 mb-2">
            {typingUsers.map((u) => u.username).join(", ")}{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{comment.user.username}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p>{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
