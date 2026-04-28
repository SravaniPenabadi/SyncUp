import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

const normalizeId = (value) => value?.toString?.() ?? value;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser?._id) return;

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set((state) => ({ messages: [...state.messages, res.data] }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  markMessagesAsSeen: async (userId) => {
    try {
      await axiosInstance.put(`/messages/seen/${userId}`);
      set((state) => ({
        messages: state.messages.map((message) =>
          normalizeId(message.senderId) === userId
            ? { ...message, seen: true, seenAt: message.seenAt || new Date().toISOString() }
            : message
        ),
      }));
    } catch (error) {
      console.log("Failed to mark messages as seen", error);
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/message/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((message) => message._id !== messageId),
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete message");
    }
  },

  deleteContact: async (contactId) => {
    try {
      await axiosInstance.delete(`/messages/contact/${contactId}`);
      set((state) => ({
        users: state.users.filter((user) => user._id !== contactId),
        selectedUser:
          state.selectedUser?._id === contactId ? null : state.selectedUser,
        messages:
          state.selectedUser?._id === contactId ? [] : state.messages,
      }));
      toast.success("Contact deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete contact");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const socket = useAuthStore.getState().socket;

    if (!selectedUser?._id || !socket) return;

    socket.off("newMessage");
    socket.off("messagesSeen");

    socket.on("newMessage", (newMessage) => {
      const incomingSenderId = normalizeId(newMessage.senderId);

      if (incomingSenderId !== selectedUser._id) return;

      set((state) => {
        if (state.messages.some((message) => message._id === newMessage._id)) {
          return state;
        }

        return { messages: [...state.messages, newMessage] };
      });
    });

    socket.on("messagesSeen", ({ receiverId }) => {
      const authUserId = useAuthStore.getState().authUser?._id;
      if (!authUserId) return;

      set((state) => ({
        messages: state.messages.map((message) =>
          normalizeId(message.senderId) === authUserId &&
          normalizeId(message.receiverId) === receiverId
            ? { ...message, seen: true, seenAt: message.seenAt || new Date().toISOString() }
            : message
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("messagesSeen");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
