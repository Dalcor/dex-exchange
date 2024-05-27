import { Form, Formik, FormikHelpers } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import * as Yup from "yup";

import { CheckboxButton } from "@/components/atoms/Checkbox";
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

interface Values {
  email: string;
  description: string;
  tags: FeedbackTag[];
}

const initialValues: Values = {
  email: "",
  description: "",
  tags: [],
};

const FeedbackSchema = Yup.object().shape({
  email: Yup.string(),
  description: Yup.string()
    .required("Required")
    .min(3, "Must be at least 3 characters")
    .max(20000, "Max number of characters 20000"),
  tags: Yup.array().of(Yup.string()),
});

function SuccessFeedback() {
  return (
    <div className="px-4 pb-4 md:pb-10 md:px-10 w-full md:w-[600px]">
      <div className="mx-auto w-[80px] h-[80px] flex items-center justify-center relative mb-5">
        <div className="w-[54px] h-[54px] rounded-full border-[7px] blur-[8px] opacity-80 border-green"></div>
        <Svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green"
          iconName="success"
          size={65}
        />
      </div>
      <h3 className="text-20 font-bold mb-2 text-center">Feedback sent successfully</h3>
      <h3 className="text-secondary-text text-center">
        Thank you for your feedback! We&apos;ll be in touch soon. Feel free to reach us via{" "}
        <a href="#" className="text-green underline">
          Telegram
        </a>{" "}
        or{" "}
        <a href="#" className="text-green underline">
          Discord
        </a>
        .
      </h3>
    </div>
  );
}
export default function FeedbackDialog() {
  const { isOpen, setIsOpen } = useFeedbackDialogStore();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useEffect(() => {
    if (isSubmitted && !isOpen) {
      setTimeout(() => {
        setIsSubmitted(false);
      }, 400);
    }
  }, [isOpen, isSubmitted]);

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
      <DrawerDialog isOpen={isOpen} setIsOpen={handleClose}>
        <DialogHeader onClose={handleClose} title="Feedback" />

        {isSubmitted ? (
          <SuccessFeedback />
        ) : (
          <div className="w-full md:w-[600px] px-4 pb-4 md:px-10 md:pb-10">
            <p className="text-secondary-text text-16 mb-5">
              Feel free to share your thoughts either by leaving a comment here or by opening an
              issue on{" "}
              <a href="#" className="text-green underline">
                Github
              </a>
            </p>
            <Formik
              initialValues={initialValues}
              validationSchema={FeedbackSchema}
              onSubmit={async (
                values: Values,
                { setSubmitting, resetForm }: FormikHelpers<Values>,
              ) => {
                console.log("Submitting...");
                setSubmitting(true);
                try {
                  const data = await fetch("https://api.dex223.io/v1/feedback", {
                    method: "POST",
                    body: JSON.stringify({
                      message: values.description,
                      contact: values.email,
                      categories: values.tags,
                    }),
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                  });
                  if (data.ok) {
                    setIsSubmitted(true);
                    addToast("Feedback sent successfully");
                    setSubmitting(false);
                    resetForm();
                  } else {
                    addToast("Something went wrong, try again later", "error");
                  }
                } catch (e) {
                  console.log(e);
                  addToast("Something went wrong, try again later", "error");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                submitForm,
                isSubmitting,
                handleChange,
                handleBlur,
                values,
                errors,
                touched,
                setFieldValue,
              }) => {
                return (
                  <Form>
                    <TextAreaField
                      id="description"
                      name="description"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Describe your issue *"
                      rows={4}
                      placeholder="Describe your issue"
                      value={values.description}
                      error={touched.description && errors.description ? errors.description : ""}
                    />

                    <div className="h-2" />

                    <TextField
                      id="email"
                      name="email"
                      placeholder="Email, wallet address or nickname "
                      label="Email, wallet address or nickname"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                    />

                    <h3 className="text-16 font-bold mb-1 flex items-center gap-1 mt-5">
                      Feedback category
                    </h3>
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
                            checked={values.tags.includes(feedbackTag)}
                            handleChange={async () => {
                              if (values.tags.includes(feedbackTag)) {
                                await setFieldValue(
                                  "tags",
                                  values.tags.filter((v) => v !== feedbackTag),
                                  false,
                                );
                              } else {
                                await setFieldValue("tags", [...values.tags, feedbackTag], false);
                              }
                            }}
                            id={feedbackTag + "_feedback_tag"}
                            label={feedbackTagLabelsMap[feedbackTag]}
                          />
                        );
                      })}
                    </div>
                    <Button
                      type="submit"
                      disabled={Boolean(errors.description && touched.description) || isSubmitting}
                      fullWidth
                      onClick={submitForm}
                    >
                      {isSubmitting ? "Submitting" : "Send feedback"}
                    </Button>
                  </Form>
                );
              }}
            </Formik>
          </div>
        )}
      </DrawerDialog>
    </>
  );
}
