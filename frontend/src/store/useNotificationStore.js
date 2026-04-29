import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
  contactRequests: [],
  messageNotifications: [],
  isLoading: false,

  // Total unread count for bell badge
  getTotalCount: () => {
    const { contactRequests, messageNotifications } = get();
    return (
      contactRequests.length +
      messageNotifications.reduce((sum, n) => sum + n.count, 0)
    );
  },

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const [reqRes, msgRes] = await Promise.all([
        axiosInstance.get("/notifications/contact-request/pending"),
        axiosInstance.get("/notifications/messages/unread"),
      ]);
      set({
        contactRequests: reqRes.data,
        messageNotifications: msgRes.data,
      });
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  sendContactRequest: async (email, onSuccess) => {
    try {
      await axiosInstance.post("/notifications/contact-request/send", { email });
      toast.success("Contact request sent!");
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  },

  acceptRequest: async (requestId) => {
    try {
      await axiosInstance.put(`/notifications/contact-request/accept/${requestId}`);
      set((state) => ({
        contactRequests: state.contactRequests.filter((r) => r._id !== requestId),
      }));
      toast.success("Contact added!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  },

  rejectRequest: async (requestId) => {
    try {
      await axiosInstance.put(`/notifications/contact-request/reject/${requestId}`);
      set((state) => ({
        contactRequests: state.contactRequests.filter((r) => r._id !== requestId),
      }));
      toast.success("Request rejected");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  },

  // Called from socket events
  addContactRequest: (request) => {
    set((state) => ({
      contactRequests: [request, ...state.contactRequests],
    }));
    toast.success(`${request.sender.fullName} sent you a contact request!`);
  },

  clearMessageNotification: (senderId) => {
    set((state) => ({
      messageNotifications: state.messageNotifications.filter(
        (n) => n.sender._id !== senderId
      ),
    }));
  },
}));