/**
 * @file src/module/registration/components/registration-form/sections/ThankYouSection.tsx
 * Final step — confirmation shown after a successful registration.
 * Dynamically handles payment if enabled in the company settings.
 */

import { useState } from "react";
import {
  CheckCircle2,
  QrCode,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRegistrationForm } from "../context";
import FormSection from "../FormSection";
import { REGISTRATION_STEP_IDS } from "../steps";
import { useCompanyQuery } from "@/module/company/hook/useCompanyQuery";
import { resolveImageUrl } from "@/lib/api/apiClient";
import { createUserPayment } from "../../../api/registration.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ThankYouSection() {
  const { t } = useTranslation();
  const { resetRegistration, registeredUserId } = useRegistrationForm();
  const { data: companyResponse, isLoading: isLoadingCompany } =
    useCompanyQuery();

  const [transactionId, setTransactionId] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const companyData = companyResponse?.data;
  const isPaymentEnabled =
    companyData?.isPayment?.trim().toLowerCase() === "yes";
  const isDiscountEnabled =
    companyData?.isDiscount?.trim().toLowerCase() === "yes";

  const actualAmount = companyData?.payment_amount?.trim();
  const discountedAmount = companyData?.discount_amount?.trim();

  const qrImageUrl = companyData?.payment_url?.trim()
    ? resolveImageUrl(
        companyData.payment_url,
        companyResponse?.image_url,
        "Company",
      )
    : null;

  const handlePaymentSubmit = async () => {
    setPaymentError(null);

    const cleanUtr = transactionId.trim();
    if (!cleanUtr) {
      setPaymentError(
        t(
          "registrationPage.payment.utrRequired",
          "Please enter your Transaction ID or UTR number.",
        ),
      );
      return;
    }

    if (cleanUtr.length < 6) {
      setPaymentError(
        t(
          "registrationPage.payment.utrMinLength",
          "Please enter a valid Transaction ID / UTR number (at least 6 characters).",
        ),
      );
      return;
    }

    setIsSubmittingPayment(true);

    try {
      const res = await createUserPayment({
        user_id: registeredUserId || "",
        payment_method: "UPI",
        payment_details: cleanUtr,
        payment_status: "Pending",
      });

      if (res.success) {
        setPaymentSuccess(true);
      } else {
        setPaymentError(
          res.message ||
            t(
              "registrationPage.payment.errorFailed",
              "Failed to submit payment details. Please try again.",
            ),
        );
      }
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : t(
              "registrationPage.payment.errorUnknown",
              "An error occurred while submitting payment details.",
            ),
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // 1. If payment is disabled or still loading (and not payment enabled), render standard Thank You
  if (!isLoadingCompany && !isPaymentEnabled) {
    return (
      <FormSection
        id={REGISTRATION_STEP_IDS.thankYou}
        title={t("registrationPage.form.thankYouTitle", "Thank You!")}
        subtitle={t(
          "registrationPage.form.thankYouBody",
          "Your bio-data registration has been submitted successfully. Our committee will review your profile within 24 to 48 hours.",
        )}
      >
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-6 text-center sm:p-8">
          <span
            className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
            aria-hidden="true"
          >
            <CheckCircle2 className="size-6" />
          </span>
          <button
            type="button"
            onClick={resetRegistration}
            className="mt-5 cursor-pointer rounded-full bg-navy-900 px-7 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800 sm:text-sm"
          >
            {t(
              "registrationPage.form.submitOtherResponse",
              "Submit other response",
            )}
          </button>
        </div>
      </FormSection>
    );
  }

  // 2. If payment is enabled:
  return (
    <FormSection
      id={REGISTRATION_STEP_IDS.thankYou}
      title={
        paymentSuccess
          ? t("registrationPage.form.thankYouTitle", "Thank You!")
          : t(
              "registrationPage.payment.title",
              "Registration Successful — Complete Payment",
            )
      }
      subtitle={
        paymentSuccess
          ? t(
              "registrationPage.payment.successSubtitle",
              "Your registration and payment verification request have been received! Our committee will review your profile.",
            )
          : t(
              "registrationPage.payment.subtitle",
              "Your registration details have been submitted. Please scan the QR code to complete the fee payment.",
            )
      }
    >
      <div className="mx-auto max-w-xl space-y-6">
        {/* Status card */}
        {paymentSuccess ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/80 p-6 text-center sm:p-8 shadow-sm">
            <span
              className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm"
              aria-hidden="true"
            >
              <CheckCircle2 className="size-8" />
            </span>
            <h3 className="mt-4 font-display text-lg font-bold text-emerald-950 sm:text-xl">
              {t(
                "registrationPage.payment.submittedHeader",
                "Payment Details Submitted",
              )}
            </h3>
            <p className="mt-2 text-sm text-emerald-900/80 leading-relaxed">
              {t(
                "registrationPage.payment.submittedText",
                "Your payment status is currently Pending verification. Once verified by our administration team, your profile will become active.",
              )}
            </p>

            <div className="mt-6 pt-4 border-t border-emerald-200">
              <button
                type="button"
                onClick={resetRegistration}
                className="cursor-pointer rounded-full bg-navy-900 px-7 py-2.5 text-xs font-bold text-white transition hover:bg-navy-800 sm:text-sm"
              >
                {t(
                  "registrationPage.form.submitOtherResponse",
                  "Submit other response",
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 px-6 py-4 text-white">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  {t(
                    "registrationPage.payment.step1BioSaved",
                    "Step 1: Bio-Data Saved",
                  )}
                </span>
                <span className="text-xs font-medium text-white/80">
                  {t(
                    "registrationPage.payment.step2FeeVerification",
                    "Step 2: Fee Verification",
                  )}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Amount display */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-stone-50 border border-stone-100 p-4 text-center">
                <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  {t("registrationPage.payment.regFee", "Registration Fee")}
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  {isDiscountEnabled && discountedAmount ? (
                    <>
                      {actualAmount && (
                        <span className="text-lg font-medium text-stone-400 line-through">
                          ₹{actualAmount}
                        </span>
                      )}
                      <span className="text-3xl font-extrabold text-navy-900">
                        ₹{discountedAmount}
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        {t(
                          "registrationPage.payment.specialOffer",
                          "Special Offer",
                        )}
                      </span>
                    </>
                  ) : (
                    actualAmount && (
                      <span className="text-3xl font-extrabold text-navy-900">
                        ₹{actualAmount}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-4 shadow-inner">
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="Payment QR Code"
                      className="size-56 sm:size-64 rounded-xl object-contain shadow-sm bg-white p-2"
                    />
                  ) : (
                    <div className="flex size-56 sm:size-64 flex-col items-center justify-center rounded-xl bg-stone-100 text-stone-400">
                      <QrCode className="size-16 stroke-1 text-stone-400 mb-2" />
                      <span className="text-xs">
                        {t(
                          "registrationPage.payment.qrUnavailable",
                          "QR Code unavailable",
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center text-xs text-stone-500 max-w-xs">
                  {t(
                    "registrationPage.payment.scanUpiHint",
                    "Scan using Google Pay, PhonePe, Paytm, or any BHIM UPI application",
                  )}
                </p>
              </div>

              {/* Transaction ID / UTR Form */}
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div>
                  <label
                    htmlFor="utr-number"
                    className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5"
                  >
                    {t(
                      "registrationPage.payment.utrLabel",
                      "Enter Transaction ID / UTR Number",
                    )}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="utr-number"
                    type="text"
                    required
                    placeholder={t(
                      "registrationPage.payment.utrPlaceholder",
                      "e.g. 3241XXXXXXXX or UPI Reference No.",
                    )}
                    value={transactionId}
                    onChange={(e) => {
                      setTransactionId(e.target.value);
                      if (paymentError) setPaymentError(null);
                    }}
                    className="h-11 rounded-xl text-sm"
                  />
                  <p className="mt-1.5 text-xs text-stone-500">
                    {t(
                      "registrationPage.payment.utrHelpText",
                      "You can find the 12-digit UTR or Transaction ID in your UPI payment receipt.",
                    )}
                  </p>
                </div>

                {paymentError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800"
                  >
                    <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={handlePaymentSubmit}
                    disabled={isSubmittingPayment || !transactionId.trim()}
                    className="w-full h-11 rounded-xl bg-navy-900 text-white font-semibold hover:bg-navy-800 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                  >
                    {isSubmittingPayment ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {t(
                          "registrationPage.payment.submittingButton",
                          "Submitting Details...",
                        )}
                      </>
                    ) : (
                      <>
                        {t(
                          "registrationPage.payment.submitButton",
                          "Submit Payment Details",
                        )}
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={resetRegistration}
                    className="text-xs text-stone-500 hover:text-stone-700 underline underline-offset-4 cursor-pointer"
                  >
                    {t(
                      "registrationPage.payment.skipButton",
                      "Skip for now or submit another response",
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
}
