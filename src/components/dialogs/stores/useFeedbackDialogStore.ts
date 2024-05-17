import { create } from "zustand";

export enum FeedbackTag {
  COMMENT,
  BUG,
  FEATURE_REQUEST,
  OTHER,
}
interface FeedbackDialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;

  description: string;
  setDescription: (description: string) => void;
  tags: Array<FeedbackTag>;
  addTag: (tag: FeedbackTag) => void;
  removeTag: (tag: FeedbackTag) => void;
}

export const useFeedbackDialogStore = create<FeedbackDialogStore>((set, get) => ({
  isOpen: false,

  description: "",
  tags: [],
  addTag: (tag) => set({ tags: [...get().tags, tag] }),
  removeTag: (tag) => set({ tags: get().tags.filter((t) => t !== tag) }),

  setDescription: (description) => set({ description }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
