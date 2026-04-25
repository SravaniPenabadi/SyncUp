import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useGroupStore = create((set, get) => ({
  groups: [],
  isCreatingGroup: false,
  isAddingContact: false,

  getMyGroups: async () => {
    try {
      const res = await axiosInstance.get("/groups/my-groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load groups");
    }
  },

  createGroup: async (data, onSuccess) => {
    set({ isCreatingGroup: true });
    try {
      const res = await axiosInstance.post("/groups/create", data);
      set((state) => ({ groups: [...state.groups, res.data] }));
      toast.success("Group created successfully!");
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create group");
    } finally {
      set({ isCreatingGroup: false });
    }
  },

  addContact: async (email, onSuccess) => {
    set({ isAddingContact: true });
    try {
      const res = await axiosInstance.post("/groups/add-contact", { email });
      toast.success(`${res.data.fullName} added to contacts!`);
      onSuccess?.(res.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add contact");
    } finally {
      set({ isAddingContact: false });
    }
  },
}));