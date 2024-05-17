import Checkbox, { CheckboxButton } from "@/components/atoms/Checkbox";
import Dialog from "@/components/atoms/Dialog";
import DialogHeader from "@/components/atoms/DialogHeader";
import DrawerDialog from "@/components/atoms/DrawerDialog";
import Svg from "@/components/atoms/Svg";
import TextAreaField from "@/components/atoms/TextAreaField";
import TextField from "@/components/atoms/TextField";
import Button from "@/components/buttons/Button";
import {
  FeedbackTag,
  useFeedbackDialogStore,
} from "@/components/dialogs/stores/useFeedbackDialogStore";
import addToast from "@/other/toast";

const feedbackTagLabelsMap: Record<FeedbackTag, string> = {
  [FeedbackTag.COMMENT]: "Comment",
  [FeedbackTag.BUG]: "Bug",
  [FeedbackTag.FEATURE_REQUEST]: "Feature request",
  [FeedbackTag.OTHER]: "Other",
};
export default function FeedbackDialog() {
  const { isOpen, setIsOpen, description, setDescription, tags, addTag, removeTag } =
    useFeedbackDialogStore();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{ transform: "rotate(-90deg) translateX(50%)" }}
        className="px-5 h-10 origin-bottom-right fixed right-0 bottom-1/2 bg-green hover:bg-green-hover duration-200 rounded-t-2 shadow-checkbox text-secondary-bg flex items-center gap-2"
      >
        Feedback
        <Svg iconName="star" />
      </button>
      <DrawerDialog isOpen={isOpen} setIsOpen={setIsOpen}>
        <DialogHeader onClose={() => setIsOpen(false)} title="Feedback" />
        <div className="w-full md:w-[600px] px-4 pb-4 md:px-10 md:pb-10">
          <p className="text-secondary-text text-16 mb-5">
            Feel free to share your thoughts either by leaving a comment here or by opening an issue
            on{" "}
            <a href="#" className="text-green underline">
              Github
            </a>
          </p>
          <TextField
            placeholder="Email, wallet address or nickname "
            label="Email, wallet address or nickname (optional)"
          />
          <div className="h-5" />
          <TextAreaField
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            error={description.length < 3 ? "Must be at least 3 characters" : ""}
            label="Describe your issue"
            rows={4}
            placeholder="Describe your issue"
          />

          <h3 className="text-16 font-bold mb-1 flex items-center gap-1 mt-5">Feedback category</h3>
          <div className="grid gap-2 grid-cols-2 mb-5">
            {[
              FeedbackTag.COMMENT,
              FeedbackTag.BUG,
              FeedbackTag.FEATURE_REQUEST,
              FeedbackTag.OTHER,
            ].map((feedbackTag) => {
              return (
                <CheckboxButton
                  key={feedbackTag}
                  checked={tags.includes(feedbackTag)}
                  handleChange={() =>
                    tags.includes(feedbackTag) ? removeTag(feedbackTag) : addTag(feedbackTag)
                  }
                  id={feedbackTag + "_feedback_tag"}
                  label={feedbackTagLabelsMap[feedbackTag]}
                />
              );
            })}
          </div>
          <Button
            onClick={() => {
              addToast("Feedback successfully sent");
              setIsOpen(false);
            }}
            fullWidth
          >
            Send feedback
          </Button>
        </div>
      </DrawerDialog>
    </>
  );
}
