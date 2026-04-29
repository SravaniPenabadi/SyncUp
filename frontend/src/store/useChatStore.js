import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // ── Chat state ──
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ── Group state ──
  groups: [],
  selectedGroup: null,
  groupMessages: [],
  isGroupsLoading: false,
  isGroupMessagesLoading: false,

  // ── Sync state ──
  syncScore: null,
  syncLabel: "",
  syncDetails: null,
  isSyncLoading: false,

  // ── Chat actions ──
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
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
      toast.error(error?.response?.data?.message || "Something went wrong");
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
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
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
      set((state) => ({
        messages: state.messages.map((m) =>
          m.senderId === senderId && !m.seen ? { ...m, seen: true } : m
        ),
      }));
    } catch (error) {
      console.log("Error marking messages as seen:", error);
    }
  },

  deleteContact: async (contactId) => {
    try {
      await axiosInstance.delete(`/messages/contact/${contactId}`);
      set((state) => ({
        users: state.users.filter((u) => u._id !== contactId),
        selectedUser: state.selectedUser?._id === contactId ? null : state.selectedUser,
      }));
      toast.success("Contact deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete contact");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;
      set({ messages: [...get().messages, newMessage] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (user) => set({ selectedUser: user, selectedGroup: null }),

  // ── Sync actions ──
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

  // ── Group actions ──
  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups/my-groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isGroupMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);
      set({ groupMessages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isGroupMessagesLoading: false });
    }
  },

  sendGroupMessage: async (messageData) => {
    const { selectedGroup, groupMessages } = get();
    try {
      const res = await axiosInstance.post(`/groups/${selectedGroup._id}/send`, messageData);
      set({ groupMessages: [...groupMessages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToGroupMessages: () => {
    const { selectedGroup } = get();
    if (!selectedGroup) return;
    const socket = useAuthStore.getState().socket;
    socket.on("newGroupMessage", ({ message, groupId }) => {
      if (groupId !== selectedGroup._id) return;
      set({ groupMessages: [...get().groupMessages, message] });
    });
  },

  unsubscribeFromGroupMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newGroupMessage");
  },

  setSelectedGroup: (group) => set({ selectedGroup: group, selectedUser: null }),
}));