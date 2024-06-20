import { create } from "zustand";

export enum FeedbackTag {
  COMMENT = "COMMENT",
  BUG = "BUG",
  FEATURE_REQUEST = "FEATURE",
  OTHER = "OTHER",
}
interface FeedbackDialogStore {
  isOpen: boolean;
  email: string;
  setIsOpen: (isOpen: boolean) => void;

  setEmail: (email: string) => void;
  description: string;
  setDescription: (description: string) => void;
  tags: Array<FeedbackTag>;
  addTag: (tag: FeedbackTag) => void;
  removeTag: (tag: FeedbackTag) => void;
}

export const useFeedbackDialogStore = create<FeedbackDialogStore>((set, get) => ({
  isOpen: false,
  email: "",
  description: "",
  tags: [],
  addTag: (tag) => set({ tags: [...get().tags, tag] }),
  removeTag: (tag) => set({ tags: get().tags.filter((t) => t !== tag) }),

  setDescription: (description) => set({ description }),
  setEmail: (email) => set({ email }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
