import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

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
      // toast.error(error.response.data.message);
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
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
      // toast.error(error.response.data.message);
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      // toast.error(error.response.data.message);
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },
deleteMessage: async (messageId) => {
  try {
    await axiosInstance.delete(`/messages/${messageId}`);
    set({ messages: get().messages.filter((m) => m._id !== messageId) });
  } catch (error) {
    toast.error(error?.response?.data?.message || "Failed to delete message");
  }
},

markMessagesAsSeen: async (senderId) => {
  try {
    await axiosInstance.put(`/messages/seen/${senderId}`);
    // Update seen status locally for instant UI update
    set((state) => ({
      messages: state.messages.map((m) =>
        m.senderId === senderId && !m.seen ? { ...m, seen: true } : m
      ),
    }));
  } catch (error) {
    console.log("Error marking messages as seen:", error);
  }
},
// Add to state
syncScore: null,
syncLabel: "",
isSyncLoading: false,

// Add action
getSyncScore: async (userId) => {
  set({ isSyncLoading: true });
  try {
    const res = await axiosInstance.get(`/messages/sync/${userId}`);
    set({
      syncScore: res.data.syncScore,
      syncLabel: res.data.label,
      syncDetails: {
        messagesLast7Days: res.data.messagesLast7Days,
        avgReplySpeed: res.data.avgReplySpeed,
        activeDaysStreak: res.data.activeDaysStreak,
      },
    });
  } catch (error) {
    console.log("Error fetching sync score:", error);
  } finally {
    set({ isSyncLoading: false });
  }
},

deleteContact: async (contactId) => {
  try {
    await axiosInstance.delete(`/messages/contact/${contactId}`);

    // Remove from users list immediately (no refresh needed)
    set((state) => ({
      users: state.users.filter((u) => u._id !== contactId),
      selectedUser:
        state.selectedUser?._id === contactId ? null : state.selectedUser,
    }));

    toast.success("Contact deleted");
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete contact");
  }
},

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));