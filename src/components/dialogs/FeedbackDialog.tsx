import { Form, Formik, FormikHelpers } from "formik";
import { useTranslations } from "next-intl";
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

type FeedbackTagTranslationTag =
  | "category_comment"
  | "category_feature"
  | "category_bug"
  | "category_other";

const feedbackTagLabelsMap: Record<FeedbackTag, FeedbackTagTranslationTag> = {
  [FeedbackTag.COMMENT]: "category_comment",
  [FeedbackTag.BUG]: "category_bug",
  [FeedbackTag.FEATURE_REQUEST]: "category_feature",
  [FeedbackTag.OTHER]: "category_other",
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
  const t = useTranslations("Feedback");

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
      <h3 className="text-20 font-bold mb-2 text-center">{t("sent_successfully")}</h3>
      <h3 className="text-secondary-text text-center">
        {t.rich("thank_you_for_the_feedback", {
          telegram: (chunks) => (
            <a href="https://t.me/Dex223_defi" className="text-green hover:underline">
              {chunks}
            </a>
          ),
          discord: (chunks) => (
            <a href="https://discord.gg/t5bdeGC5Jk" className="text-green hover:underline">
              {chunks}
            </a>
          ),
        })}
      </h3>
    </div>
  );
}
export default function FeedbackDialog() {
  const t = useTranslations("Feedback");

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
        className="hidden xl:flex px-5 h-10 origin-bottom-right fixed right-0 bottom-1/2 bg-green hover:bg-green-hover duration-200 rounded-t-2 shadow-checkbox text-secondary-bg items-center gap-2"
      >
        {t("feedback")}
        <Svg iconName="star" />
      </button>
      <DrawerDialog isOpen={isOpen} setIsOpen={handleClose}>
        <DialogHeader onClose={handleClose} title={t("feedback")} />

        {isSubmitted ? (
          <SuccessFeedback />
        ) : (
          <div className="w-full md:w-[600px] px-4 pb-4 md:px-10 md:pb-10">
            <p className="text-secondary-text text-16 mb-5">
              {t.rich("feel_free_to_share", {
                github: (chunks) => (
                  <a
                    href="https://github.com/EthereumCommonwealth/Dex223-UI/issues"
                    className="text-green hover:underline"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
            <Formik
              initialValues={initialValues}
              validationSchema={FeedbackSchema}
              onSubmit={async (
                values: Values,
                { setSubmitting, resetForm }: FormikHelpers<Values>,
              ) => {
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
                    addToast(t("sent_successfully"));
                    setSubmitting(false);
                    resetForm();
                  } else {
                    addToast(t("something_went_wrong"), "error");
                  }
                } catch (e) {
                  console.log(e);
                  addToast(t("something_went_wrong"), "error");
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
                      label={`${t("describe_your_issue")} *`}
                      rows={4}
                      placeholder={t("describe_your_issue")}
                      value={values.description}
                      error={touched.description && errors.description ? errors.description : ""}
                    />

                    <div className="h-2" />

                    <TextField
                      id="email"
                      name="email"
                      placeholder={t("email_wallet_address_or_nickname")}
                      label={t("email_wallet_address_or_nickname")}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                    />

                    <h3 className="text-16 font-bold mb-1 flex items-center gap-1 mt-5">
                      {t("feedback_category")}
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
                            label={t(feedbackTagLabelsMap[feedbackTag])}
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
                      {isSubmitting ? t("submitting") : t("send_feedback")}
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
