/**
 * @file src/module/registration/components/registration-form/sections/PersonalDetailsSection.tsx
 * Part 1 — Personal & Family Details: identification, education, profession,
 * community/gotra, physical attributes, marital history, parents & siblings,
 * address and contact details.
 */

import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { FormSelect } from "@/components/ui/form-select";
import { OptionPills } from "@/components/ui/option-pills";
import { Users, MapPin, Phone, Check, Plus } from "lucide-react";
import { cn } from "cn";
import { useRegistrationForm } from "../context";
import FormSection from "../FormSection";
import { REGISTRATION_STEP_IDS } from "../steps";
import MobileNumberField from "../../MobileNumberField";

interface PersonalDetailsSectionProps {
  /** Optional footer rendered inside the section sheet (wizard nav). */
  footer?: ReactNode;
}

export default function PersonalDetailsSection({
  footer,
}: PersonalDetailsSectionProps) {
  const { t } = useTranslation();
  const {
    baseId,
    form,
    fieldErrors,
    clearFieldError,
    setForm,
    handleInputChange,
    handleNumericInput,
    handleSelectChange,
    handleTimeChange,
    handlePillChange,
    handlePasteCapture,
    toggleCommunityPreference,
    selectAllCommunities,
    educationOptions,
    professionOptions,
    communityOptions,
    gotraOptions,
    loadingGotras,
    loadingOptions,
    conditions,
    isMobileVerifiedNow,
    openOtpModal,
  } = useRegistrationForm();

  const {
    isEmployed,
    isBusiness,
    isOtherProfession,
    showIncome,
    isDivorced,
    hasPriorMarriage,
    showChildrenWith,
  } = conditions;

  // Dynamic CSS helper based on field validation status (shadcn-aligned brand style)
  const inputCls = (key: string) =>
    cn(
      "h-11 w-full rounded-full border px-4 py-2 text-base md:text-sm font-medium text-navy-900 transition outline-none focus-visible:ring-2",
      "placeholder:font-normal placeholder:text-ink-400",
      fieldErrors[key]
        ? "border-maroon-500 bg-maroon-50/30 focus-visible:border-maroon-600 focus-visible:ring-maroon-500/20"
        : "border-cream-300 bg-cream-50/70 hover:bg-white hover:border-gold-500/60 focus-visible:border-gold-500 focus-visible:bg-white focus-visible:ring-gold-500/20",
    );

  // Divorce follow-up stays beside the marital select
  const divorceStatusField = (
    <div className="animate-fade-in">
      <Field
        id={`${baseId}-divorce-status`}
        label={t("registrationPage.form.divorceStatusLabel", "Divorce Status")}
        required
        error={fieldErrors.divorce_status}
      >
        <FormSelect
          id={`${baseId}-divorce-status`}
          value={form.divorce_status ?? ""}
          onValueChange={handleSelectChange("divorce_status")}
          options={[
            {
              value: "Decree in process",
              label: t(
                "registrationPage.form.decreeInProcess",
                "Decree in process",
              ),
            },
            {
              value: "Decree granted less than 6 months back",
              label: t(
                "registrationPage.form.decreeUnder6m",
                "Decree granted less than 6 months back",
              ),
            },
            {
              value: "Decree granted less than 2 years back",
              label: t(
                "registrationPage.form.decreeUnder2y",
                "Decree granted less than 2 years back",
              ),
            },
            {
              value: "Decree granted less than 5 years back",
              label: t(
                "registrationPage.form.decreeUnder5y",
                "Decree granted less than 5 years back",
              ),
            },
            {
              value: "Decree granted more than 5 years back",
              label: t(
                "registrationPage.form.decreeOver5y",
                "Decree granted more than 5 years back",
              ),
            },
          ]}
          placeholder={t(
            "registrationPage.form.divorceStatusPlaceholder",
            "Select Divorce Status",
          )}
          error={Boolean(fieldErrors.divorce_status)}
          aria-invalid={Boolean(fieldErrors.divorce_status)}
        />
      </Field>
    </div>
  );

  // Children follow-ups render under Community Preferences
  const childrenFields = (
    <>
      {/* Condition: Children from prior marriage */}
      {hasPriorMarriage && (
        <div className="animate-fade-in">
          <Field
            id={`${baseId}-children`}
            label={t(
              "registrationPage.form.childrenLabel",
              "Children from Prior Marriage",
            )}
          >
            <Input
              id={`${baseId}-children`}
              type="text"
              name="children_from_prior_marriage"
              maxLength={2}
              value={form.children_from_prior_marriage}
              onChange={handleNumericInput}
              onPaste={handlePasteCapture("children_from_prior_marriage")}
              placeholder={t(
                "registrationPage.form.childrenPlaceholder",
                "Number of children (e.g. 0, 1, 2)",
              )}
              className={inputCls("children_from_prior_marriage")}
            />
          </Field>
        </div>
      )}

      {/* Sub-condition: Children with */}
      {showChildrenWith && (
        <div className="animate-fade-in">
          <Field
            id={`${baseId}-children-with`}
            label={t(
              "registrationPage.form.childrenWithLabel",
              "Children Residing With",
            )}
            required
            error={fieldErrors.children_with}
          >
            <FormSelect
              id={`${baseId}-children-with`}
              value={form.children_with ?? ""}
              onValueChange={handleSelectChange("children_with")}
              options={[
                {
                  value: "All with me",
                  label: t(
                    "registrationPage.form.childrenWithMe",
                    "All with me",
                  ),
                },
                {
                  value: "All with ex-spouse",
                  label: t(
                    "registrationPage.form.childrenWithEx",
                    "All with ex-spouse",
                  ),
                },
                {
                  value: "Shared between us",
                  label: t(
                    "registrationPage.form.childrenShared",
                    "Shared between us",
                  ),
                },
              ]}
              placeholder={t(
                "registrationPage.form.childrenWithPlaceholder",
                "Select living arrangement",
              )}
              error={Boolean(fieldErrors.children_with)}
              aria-invalid={Boolean(fieldErrors.children_with)}
            />
          </Field>
        </div>
      )}
    </>
  );

  return (
    <FormSection
      id={REGISTRATION_STEP_IDS.personal}
      title={t("registrationPage.form.part1Title", "Personal & Family Details")}
      subtitle={t(
        "registrationPage.form.part1Subtitle",
        "Basic identification, educational qualifications, background, and family records.",
      )}
      footer={footer}
    >
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Full Name */}
        <Field
          id={`${baseId}-name`}
          label={t("registrationPage.form.nameLabel", "Full Name")}
          required
          error={fieldErrors.name}
        >
          <Input
            id={`${baseId}-name`}
            type="text"
            name="name"
            maxLength={45}
            value={form.name}
            onChange={handleInputChange}
            onPaste={handlePasteCapture("name")}
            placeholder={t(
              "registrationPage.form.namePlaceholder",
              "Candidate Full Name",
            )}
            className={inputCls("name")}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={
              fieldErrors.name ? `${baseId}-name-error` : undefined
            }
          />
        </Field>

        {/* Gender (radio pill selection) */}
        <div id={`${baseId}-gender`}>
          <span className="mb-2 block text-[13px] font-semibold leading-tight tracking-tight text-navy-900">
            {t("registrationPage.form.genderLabel", "Gender")}{" "}
            <span className="text-maroon-600" aria-hidden="true">
              *
            </span>
          </span>
          <OptionPills
            id={`${baseId}-gender-pills`}
            name="gender"
            value={form.gender}
            onChange={handleSelectChange("gender")}
            options={[
              {
                value: "Male",
                label: t("registrationPage.form.genderMale", "Male"),
              },
              {
                value: "Female",
                label: t("registrationPage.form.genderFemale", "Female"),
              },
            ]}
            error={Boolean(fieldErrors.gender)}
            ariaLabel={t("registrationPage.form.genderLabel", "Gender")}
          />
          {fieldErrors.gender && (
            <p
              role="alert"
              id={`${baseId}-gender-error`}
              className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-maroon-600"
            >
              {fieldErrors.gender}
            </p>
          )}
        </div>

        {/* Date of Birth with shadcn-styled DatePicker */}
        <Field
          id={`${baseId}-dob`}
          label={t("registrationPage.form.dobLabel", "Date of Birth")}
          required
          error={fieldErrors.date_of_birth}
        >
          <DatePicker
            id={`${baseId}-dob`}
            value={form.date_of_birth}
            onChange={(dateStr) => {
              setForm((prev) => ({ ...prev, date_of_birth: dateStr }));
              clearFieldError("date_of_birth");
            }}
            error={Boolean(fieldErrors.date_of_birth)}
            placeholder={t(
              "registrationPage.form.dobPlaceholder",
              "Select Date of Birth",
            )}
            minAge={form.gender === "Male" ? 21 : 18}
          />
        </Field>

        {/* Time of Birth with native TimePicker */}
        <div id={`${baseId}-birthtime`}>
          <Field
            id={`${baseId}-birthtime-input`}
            label={t("registrationPage.form.birthTimeLabel", "Time of Birth")}
            required
            error={fieldErrors.time_of_birth}
          >
            <TimePicker
              id={`${baseId}-birthtime-input`}
              value={form.time_of_birth}
              onChange={handleTimeChange}
              error={Boolean(fieldErrors.time_of_birth)}
            />
          </Field>
        </div>

        {/* Place of Birth */}
        <Field
          id={`${baseId}-pob`}
          label={t("registrationPage.form.pobLabel", "Place of Birth")}
          required
          error={fieldErrors.place_of_birth}
        >
          <Input
            id={`${baseId}-pob`}
            type="text"
            name="place_of_birth"
            maxLength={25}
            value={form.place_of_birth}
            onChange={handleInputChange}
            onPaste={handlePasteCapture("place_of_birth")}
            placeholder={t(
              "registrationPage.form.pobPlaceholder",
              "City / District",
            )}
            className={inputCls("place_of_birth")}
            aria-invalid={Boolean(fieldErrors.place_of_birth)}
          />
        </Field>

        {/* Email Address (optional) */}
        <Field
          id={`${baseId}-email`}
          label={t("registrationPage.form.emailLabel", "Email Address")}
          error={fieldErrors.email}
        >
          <Input
            id={`${baseId}-email`}
            type="email"
            name="email"
            maxLength={65}
            value={form.email}
            onChange={handleInputChange}
            onPaste={handlePasteCapture("email")}
            placeholder={t(
              "registrationPage.form.emailPlaceholder",
              "name@example.com",
            )} /* taste-skill-ignore: RFC 2606 reserved example address */
            className={inputCls("email")}
            aria-invalid={Boolean(fieldErrors.email)}
          />
        </Field>

        {/* Education Qualification (API Dropdown) */}
        <Field
          id={`${baseId}-edu`}
          label={t("registrationPage.form.educationLabel", "Education")}
          required
          error={fieldErrors.education_id}
        >
          <FormSelect
            id={`${baseId}-edu`}
            value={form.education_id}
            onValueChange={handleSelectChange("education_id")}
            options={educationOptions}
            placeholder={t(
              "registrationPage.form.educationPlaceholder",
              "Select Qualification",
            )}
            error={Boolean(fieldErrors.education_id)}
            loading={loadingOptions}
            loadingText={t(
              "registrationPage.form.optionsLoading",
              "Loading...",
            )}
            aria-invalid={Boolean(fieldErrors.education_id)}
          />
        </Field>

        {/* Profession (API Dropdown) */}
        <Field
          id={`${baseId}-profession`}
          label={t("registrationPage.form.professionLabel", "Profession")}
          required
          error={fieldErrors.profession_id}
        >
          <FormSelect
            id={`${baseId}-profession`}
            value={form.profession_id}
            onValueChange={handleSelectChange("profession_id")}
            options={professionOptions}
            placeholder={t(
              "registrationPage.form.professionPlaceholder",
              "Select Profession",
            )}
            error={Boolean(fieldErrors.profession_id)}
            loading={loadingOptions}
            loadingText={t(
              "registrationPage.form.optionsLoading",
              "Loading...",
            )}
            aria-invalid={Boolean(fieldErrors.profession_id)}
          />
        </Field>

        {/* Condition 2: Dynamic fields based on Profession */}
        {isEmployed && (
          <>
            <div className="animate-fade-in">
              <Field
                id={`${baseId}-company-name`}
                label={t(
                  "registrationPage.form.companyNameLabel",
                  "Company Name",
                )}
                error={fieldErrors.company_name}
              >
                <Input
                  id={`${baseId}-company-name`}
                  type="text"
                  name="company_name"
                  maxLength={45}
                  value={form.company_name}
                  onChange={handleInputChange}
                  onPaste={handlePasteCapture("company_name")}
                  placeholder={t(
                    "registrationPage.form.companyNamePlaceholder",
                    "e.g. Infosys, TCS, Govt Dept",
                  )}
                  className={inputCls("company_name")}
                  aria-invalid={Boolean(fieldErrors.company_name)}
                />
              </Field>
            </div>
            <div className="animate-fade-in">
              <Field
                id={`${baseId}-company-type`}
                label={t(
                  "registrationPage.form.companyTypeLabel",
                  "Company Type",
                )}
                error={fieldErrors.company_type}
              >
                <Input
                  id={`${baseId}-company-type`}
                  type="text"
                  name="company_type"
                  maxLength={45}
                  value={form.company_type}
                  onChange={handleInputChange}
                  onPaste={handlePasteCapture("company_type")}
                  placeholder={t(
                    "registrationPage.form.companyTypePlaceholder",
                    "e.g. IT, Banking, PSU",
                  )}
                  className={inputCls("company_type")}
                  aria-invalid={Boolean(fieldErrors.company_type)}
                />
              </Field>
            </div>
          </>
        )}

        {isBusiness && (
          <>
            <div className="animate-fade-in">
              <Field
                id={`${baseId}-company-name`}
                label={t("registrationPage.form.bizNameLabel", "Business Name")}
                error={fieldErrors.company_name}
              >
                <Input
                  id={`${baseId}-company-name`}
                  type="text"
                  name="company_name"
                  maxLength={45}
                  value={form.company_name}
                  onChange={handleInputChange}
                  onPaste={handlePasteCapture("company_name")}
                  placeholder={t(
                    "registrationPage.form.bizNamePlaceholder",
                    "e.g. Agarwal Traders",
                  )}
                  className={inputCls("company_name")}
                  aria-invalid={Boolean(fieldErrors.company_name)}
                />
              </Field>
            </div>
            <div className="animate-fade-in">
              <Field
                id={`${baseId}-company-type`}
                label={t("registrationPage.form.bizTypeLabel", "Business Type")}
                error={fieldErrors.company_type}
              >
                <Input
                  id={`${baseId}-company-type`}
                  type="text"
                  name="company_type"
                  maxLength={45}
                  value={form.company_type}
                  onChange={handleInputChange}
                  onPaste={handlePasteCapture("company_type")}
                  placeholder={t(
                    "registrationPage.form.bizTypePlaceholder",
                    "e.g. Retail, Wholesale, Manufacturing",
                  )}
                  className={inputCls("company_type")}
                  aria-invalid={Boolean(fieldErrors.company_type)}
                />
              </Field>
            </div>
          </>
        )}

        {isOtherProfession && (
          <div className="animate-fade-in">
            <Field
              id={`${baseId}-company-name`}
              label={t(
                "registrationPage.form.otherProfLabel",
                "Other Profession",
              )}
              error={fieldErrors.company_name}
            >
              <Input
                id={`${baseId}-company-name`}
                type="text"
                name="company_name"
                maxLength={45}
                value={form.company_name}
                onChange={handleInputChange}
                onPaste={handlePasteCapture("company_name")}
                placeholder={t(
                  "registrationPage.form.otherProfPlaceholder",
                  "Specify Profession",
                )}
                className={inputCls("company_name")}
                aria-invalid={Boolean(fieldErrors.company_name)}
              />
            </Field>
          </div>
        )}

        {showIncome && (
          <div className="animate-fade-in">
            <Field
              id={`${baseId}-income`}
              label={t(
                "registrationPage.form.incomeLabel",
                "Annual Income (in Lakhs)",
              )}
              error={fieldErrors.annual_income}
            >
              <Input
                id={`${baseId}-income`}
                type="text"
                name="annual_income"
                maxLength={3}
                value={form.annual_income}
                onChange={(e) => handleNumericInput(e, 300)}
                onPaste={handlePasteCapture("annual_income")}
                placeholder={t(
                  "registrationPage.form.incomePlaceholder",
                  "e.g. 15",
                )}
                className={inputCls("annual_income")}
                aria-invalid={Boolean(fieldErrors.annual_income)}
              />
            </Field>
          </div>
        )}

        {/* My Community (API Dropdown) */}
        <Field
          id={`${baseId}-community`}
          label={t("registrationPage.form.communityLabel", "My Community")}
          required
          error={fieldErrors.community_id}
        >
          <FormSelect
            id={`${baseId}-community`}
            value={form.community_id}
            onValueChange={handleSelectChange("community_id")}
            options={communityOptions}
            placeholder={t(
              "registrationPage.form.communityPlaceholder",
              "Select Community",
            )}
            error={Boolean(fieldErrors.community_id)}
            loading={loadingOptions}
            loadingText={t(
              "registrationPage.form.optionsLoading",
              "Loading...",
            )}
            aria-invalid={Boolean(fieldErrors.community_id)}
          />
        </Field>

        {/* Gotra (Cascade loaded from Community) */}
        <Field
          id={`${baseId}-gotra`}
          label={t("registrationPage.form.gotraLabel", "Gotra")}
          required
          error={fieldErrors.gotra_id}
        >
          <FormSelect
            id={`${baseId}-gotra`}
            value={form.gotra_id}
            onValueChange={handleSelectChange("gotra_id")}
            options={gotraOptions}
            placeholder={t(
              "registrationPage.form.gotraPlaceholder",
              "Select Gotra",
            )}
            error={Boolean(fieldErrors.gotra_id)}
            disabled={!form.community_id}
            loading={loadingGotras}
            loadingText={t(
              "registrationPage.form.gotraLoading",
              "Loading Gotras...",
            )}
            disabledText={t(
              "registrationPage.form.gotraDisabled",
              "First select Community",
            )}
            aria-invalid={Boolean(fieldErrors.gotra_id)}
          />
        </Field>

        {/* Height (Feet & Inches) */}
        <div>
          <span className="mb-2 block text-[13px] font-semibold leading-tight tracking-tight text-navy-900">
            {t("registrationPage.form.heightLabel", "Height")}{" "}
            <span className="text-maroon-600" aria-hidden="true">
              *
            </span>
          </span>
          <div className="w-full grid grid-cols-2 gap-2.5">
            <FormSelect
              id={`${baseId}-height-feet`}
              value={form.height_feet}
              onValueChange={handleSelectChange("height_feet")}
              options={[
                {
                  value: "4",
                  label: `4 ${t("registrationPage.form.heightFtUnit", "ft")}`,
                },
                {
                  value: "5",
                  label: `5 ${t("registrationPage.form.heightFtUnit", "ft")}`,
                },
                {
                  value: "6",
                  label: `6 ${t("registrationPage.form.heightFtUnit", "ft")}`,
                },
                {
                  value: "7",
                  label: `7 ${t("registrationPage.form.heightFtUnit", "ft")}`,
                },
              ]}
              placeholder={t("registrationPage.form.heightFeet", "Feet")}
              error={Boolean(fieldErrors.height_feet)}
              aria-invalid={Boolean(fieldErrors.height_feet)}
              className="pl-3 pr-7 text-[13px] md:text-[13px]"
            />
            <FormSelect
              id={`${baseId}-height-inch`}
              value={form.height_inch}
              onValueChange={handleSelectChange("height_inch")}
              options={[...Array(12).keys()].map((inch) => ({
                value: String(inch),
                label: `${inch} ${t("registrationPage.form.heightInUnit", "in")}`,
              }))}
              placeholder={t("registrationPage.form.heightInch", "Inch")}
              error={Boolean(fieldErrors.height_inch)}
              aria-invalid={Boolean(fieldErrors.height_inch)}
              className="pl-3 pr-7 text-[13px] md:text-[13px]"
            />
          </div>
          {(fieldErrors.height_feet || fieldErrors.height_inch) && (
            <p
              role="alert"
              className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-maroon-600"
            >
              {fieldErrors.height_feet || fieldErrors.height_inch}
            </p>
          )}
        </div>

        {/* Physical Disability */}
        <Field
          id={`${baseId}-disability`}
          label={t(
            "registrationPage.form.disabilityLabel",
            "Physical Disability (if any)",
          )}
          required
          error={fieldErrors.physical_disablity}
        >
          <OptionPills
            id={`${baseId}-disability-pills`}
            name="physical_disablity"
            value={form.physical_disablity}
            onChange={handlePillChange("physical_disablity")}
            options={[
              { value: "No", label: t("registrationPage.form.no", "No") },
              { value: "Yes", label: t("registrationPage.form.yes", "Yes") },
            ]}
            error={Boolean(fieldErrors.physical_disablity)}
          />
          {/* Hidden native select keeps the focus/scroll target id stable */}
          <select
            id={`${baseId}-disability`}
            name="physical_disablity"
            value={form.physical_disablity}
            onChange={handleInputChange}
            className="sr-only"
            aria-hidden
            tabIndex={-1}
          >
            <option value="">
              {t("registrationPage.form.disabilitySelect", "Please Select")}
            </option>
            <option value="No">{t("registrationPage.form.no", "No")}</option>
            <option value="Yes">{t("registrationPage.form.yes", "Yes")}</option>
          </select>
        </Field>
      </div>

      {/* Community Preferences + marital history */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:items-start">
        <div className="space-y-4">
          {/* Community Preferences multi-select chips */}
          <div
            id={`${baseId}-comm-prefs`}
            className="rounded-2xl border border-cream-300 bg-cream-50/70 p-4 sm:p-5"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[13px] font-semibold leading-tight tracking-tight text-navy-900">
                <Users
                  className="size-4 shrink-0 text-ink-400"
                  aria-hidden="true"
                />
                {t(
                  "registrationPage.form.commPrefsLabel",
                  "Community Preferences (Select eligible communities)",
                )}
                <span className="text-maroon-600" aria-hidden="true">
                  *
                </span>
              </span>
              {communityOptions.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllCommunities}
                  className="shrink-0 cursor-pointer rounded-full border border-gold-500/40 bg-white px-3 py-1 text-[11px] font-semibold text-gold-700 transition hover:border-gold-500 hover:bg-gold-50"
                >
                  {communityOptions.every((c) =>
                    form.marry_in_community.includes(c.value),
                  )
                    ? t("registrationPage.form.deselectAll", "Deselect All")
                    : t(
                        "registrationPage.form.selectAll",
                        "Select All Communities",
                      )}
                </button>
              )}
            </div>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Community preferences"
            >
              {communityOptions.length === 0 ? (
                <p className="text-xs text-navy-500 italic">
                  {t(
                    "registrationPage.form.loadingCommunities",
                    "Loading communities...",
                  )}
                </p>
              ) : (
                communityOptions.map((comm) => {
                  const selected = form.marry_in_community.includes(comm.value);
                  return (
                    <button
                      key={comm.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleCommunityPreference(comm.value)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition outline-none active:scale-95 cursor-pointer",
                        "focus-visible:ring-2 focus-visible:ring-gold-500/40",
                        selected
                          ? "border-navy-900 bg-navy-900 text-white"
                          : "border-cream-300 bg-white text-navy-800 hover:border-gold-500/60 hover:bg-gold-50",
                      )}
                    >
                      {selected ? (
                        <Check
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Plus
                          className="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {comm.label}
                    </button>
                  );
                })
              )}
            </div>
            {fieldErrors.marry_in_community && (
              <p
                role="alert"
                className="mt-2.5 flex items-start gap-1.5 text-xs font-semibold text-maroon-600"
              >
                {fieldErrors.marry_in_community}
              </p>
            )}
          </div>
        </div>

        {/* Marital History — sits beside Community Preferences */}
        <div className="space-y-4">
          <Field
            id={`${baseId}-prior-marriage`}
            label={t(
              "registrationPage.form.marriedBeforeLabel",
              "Married Before?",
            )}
            required
            error={fieldErrors.married_before}
          >
            <FormSelect
              id={`${baseId}-prior-marriage`}
              value={form.married_before}
              onValueChange={handleSelectChange("married_before")}
              options={[
                {
                  value: "No",
                  label: t(
                    "registrationPage.form.marriedNever",
                    "No (Never Married)",
                  ),
                },
                {
                  value: "Yes and Divorced",
                  label: t(
                    "registrationPage.form.marriedDivorced",
                    "Yes and Divorced",
                  ),
                },
                {
                  value: "Yes and Spouse died",
                  label: t(
                    "registrationPage.form.marriedWidowed",
                    "Yes and Spouse died",
                  ),
                },
              ]}
              placeholder={t(
                "registrationPage.form.marriedBeforePlaceholder",
                "Please Select",
              )}
              error={Boolean(fieldErrors.married_before)}
              aria-invalid={Boolean(fieldErrors.married_before)}
            />
          </Field>

          {/* Divorce follow-up stays beside the marital select */}
          {isDivorced && divorceStatusField}

          {/* Children follow-ups come after the marital history */}
          {hasPriorMarriage && childrenFields}
        </div>
      </div>

      {/* Parents and Siblings row */}
      <div className="mt-6 border-t border-cream-200 pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-navy-900">
          <Users className="size-4 shrink-0" aria-hidden="true" />
          {t("registrationPage.form.parentsSiblingsHeading", "Family Details")}
        </h3>
        {/* Parents & siblings — one row on desktop */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr] [&_label]:min-h-9">
          <Field
            id={`${baseId}-father`}
            label={t("registrationPage.form.fatherLabel", "Father's Name")}
            required
            error={fieldErrors.father_name}
          >
            <Input
              id={`${baseId}-father`}
              type="text"
              name="father_name"
              maxLength={25}
              value={form.father_name}
              onChange={handleInputChange}
              onPaste={handlePasteCapture("father_name")}
              placeholder={t(
                "registrationPage.form.fatherPlaceholder",
                "Father's Full Name",
              )}
              className={inputCls("father_name")}
              aria-invalid={Boolean(fieldErrors.father_name)}
            />
          </Field>

          <Field
            id={`${baseId}-mother`}
            label={t("registrationPage.form.motherLabel", "Mother's Name")}
            error={fieldErrors.mother_name}
          >
            <Input
              id={`${baseId}-mother`}
              type="text"
              name="mother_name"
              maxLength={25}
              value={form.mother_name}
              onChange={handleInputChange}
              onPaste={handlePasteCapture("mother_name")}
              placeholder={t(
                "registrationPage.form.motherPlaceholder",
                "Mother's Full Name",
              )}
              className={inputCls("mother_name")}
              aria-invalid={Boolean(fieldErrors.mother_name)}
            />
          </Field>

          <Field
            id={`${baseId}-bro-married`}
            label={t(
              "registrationPage.form.broMarriedLabel",
              "Brothers (Married)",
            )}
            required
            error={fieldErrors.brother_married}
          >
            <FormSelect
              id={`${baseId}-bro-married`}
              value={form.brother_married}
              onValueChange={handleSelectChange("brother_married")}
              options={[0, 1, 2, 3, 4, 5].map((n) => ({
                value: String(n),
                label: String(n),
              }))}
              placeholder={t(
                "registrationPage.form.siblingPlaceholder",
                "Select",
              )}
            />
          </Field>

          <Field
            id={`${baseId}-bro-unmarried`}
            label={t(
              "registrationPage.form.broUnmarriedLabel",
              "Brothers (Unmarried)",
            )}
            required
            error={fieldErrors.brother_un_married}
          >
            <FormSelect
              id={`${baseId}-bro-unmarried`}
              value={form.brother_un_married}
              onValueChange={handleSelectChange("brother_un_married")}
              options={[0, 1, 2, 3, 4, 5].map((n) => ({
                value: String(n),
                label: String(n),
              }))}
              placeholder={t(
                "registrationPage.form.siblingPlaceholder",
                "Select",
              )}
            />
          </Field>

          <Field
            id={`${baseId}-sis-married`}
            label={t(
              "registrationPage.form.sisMarriedLabel",
              "Sisters (Married)",
            )}
            required
            error={fieldErrors.sister_married}
          >
            <FormSelect
              id={`${baseId}-sis-married`}
              value={form.sister_married}
              onValueChange={handleSelectChange("sister_married")}
              options={[0, 1, 2, 3, 4, 5].map((n) => ({
                value: String(n),
                label: String(n),
              }))}
              placeholder={t(
                "registrationPage.form.siblingPlaceholder",
                "Select",
              )}
            />
          </Field>

          <Field
            id={`${baseId}-sis-unmarried`}
            label={t(
              "registrationPage.form.sisUnmarriedLabel",
              "Sisters (Unmarried)",
            )}
            required
            error={fieldErrors.sister_un_married}
          >
            <FormSelect
              id={`${baseId}-sis-unmarried`}
              value={form.sister_un_married}
              onValueChange={handleSelectChange("sister_un_married")}
              options={[0, 1, 2, 3, 4, 5].map((n) => ({
                value: String(n),
                label: String(n),
              }))}
              placeholder={t(
                "registrationPage.form.siblingPlaceholder",
                "Select",
              )}
            />
          </Field>
        </div>
      </div>

      {/* Residential Address, House type, Years */}
      <div className="mt-6 border-t border-cream-200 pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-navy-900">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {t("registrationPage.form.addressHeading", "Address & Housing")}
        </h3>
        <div className="grid grid-cols-1 gap-x-5 gap-y-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Field
              id={`${baseId}-address`}
              label={t(
                "registrationPage.form.addressLabel",
                "Current Residential Address (Candidate)",
              )}
              required
              hint={`${500 - form.user_address.length} ${t("registrationPage.form.charsLeft", "chars left")}`}
              error={fieldErrors.user_address}
              className="lg:flex lg:h-full lg:flex-col"
            >
              <Textarea
                id={`${baseId}-address`}
                name="user_address"
                rows={3}
                maxLength={500}
                value={form.user_address}
                onChange={handleInputChange}
                onPaste={handlePasteCapture("user_address")}
                placeholder={t(
                  "registrationPage.form.addressPlaceholder",
                  "Enter full address with postal pincode",
                )}
                className={cn(
                  inputCls("user_address"),
                  "rounded-2xl lg:flex-1 lg:resize-none",
                )}
                aria-invalid={Boolean(fieldErrors.user_address)}
              />
            </Field>
          </div>

          <div className="space-y-4">
            <div id={`${baseId}-house-type-group`}>
              <span className="mb-2 block text-[13px] font-semibold leading-tight tracking-tight text-navy-900">
                {t("registrationPage.form.houseTypeLabel", "House Type")}{" "}
                <span className="text-maroon-600" aria-hidden="true">
                  *
                </span>
              </span>
              <OptionPills
                id={`${baseId}-house-type-pills`}
                name="house_type"
                value={form.house_type}
                onChange={handlePillChange("house_type")}
                options={[
                  {
                    value: "Own",
                    label: t("registrationPage.form.houseOwn", "Own"),
                  },
                  {
                    value: "Rent",
                    label: t("registrationPage.form.houseRent", "Rent"),
                  },
                ]}
                error={Boolean(fieldErrors.house_type)}
                ariaLabel={t(
                  "registrationPage.form.houseTypeLabel",
                  "House Type",
                )}
              />
              {/* Hidden native input keeps the scroll/focus target id stable */}
              <input
                id={`${baseId}-house-type-anchor`}
                type="text"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                readOnly
                value=""
              />
              {fieldErrors.house_type && (
                <p
                  role="alert"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-maroon-600"
                >
                  {fieldErrors.house_type}
                </p>
              )}
            </div>

            <Field
              id={`${baseId}-current-city`}
              label={t(
                "registrationPage.form.cityLabel",
                "Present City / Parents Location",
              )}
              required
              error={fieldErrors.user_current_city}
            >
              <Input
                id={`${baseId}-current-city`}
                type="text"
                name="user_current_city"
                maxLength={45}
                value={form.user_current_city}
                onChange={handleInputChange}
                onPaste={handlePasteCapture("user_current_city")}
                placeholder={t(
                  "registrationPage.form.cityPlaceholder",
                  "e.g. Bengaluru, Delhi, Mumbai",
                )}
                className={inputCls("user_current_city")}
                aria-invalid={Boolean(fieldErrors.user_current_city)}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Current City & Contacts */}
      <div className="mt-6 border-t border-cream-200 pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-navy-900">
          <Phone className="size-4 shrink-0" aria-hidden="true" />
          {t(
            "registrationPage.form.locationHeading",
            "Location & Contact Details",
          )}
        </h3>

        {/* Main & Alternate Contacts — one row on desktop */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            id={`${baseId}-contact-name`}
            label={t(
              "registrationPage.form.contactNameLabel",
              "Main Contact Person",
            )}
            required
            error={fieldErrors.contact_name}
          >
            <Input
              id={`${baseId}-contact-name`}
              type="text"
              name="contact_name"
              maxLength={45}
              value={form.contact_name}
              onChange={handleInputChange}
              onPaste={handlePasteCapture("contact_name")}
              placeholder={t(
                "registrationPage.form.contactNamePlaceholder",
                "Name of contact person",
              )}
              className={inputCls("contact_name")}
              aria-invalid={Boolean(fieldErrors.contact_name)}
            />
          </Field>

          <MobileNumberField
            id={`${baseId}-contact-mobile`}
            label={t(
              "registrationPage.form.contactMobileLabel",
              "Main Contact Mobile",
            )}
            value={form.mobile}
            onChange={handleNumericInput}
            onPaste={handlePasteCapture("mobile")}
            isVerified={isMobileVerifiedNow}
            onVerify={openOtpModal}
            error={fieldErrors.mobile}
            inputClassName={inputCls("mobile")}
          />

          <Field
            id={`${baseId}-alt-name`}
            label={t(
              "registrationPage.form.altContactNameLabel",
              "Alternate Contact Person",
            )}
            required
            error={fieldErrors.alternate_contact_name}
          >
            <Input
              id={`${baseId}-alt-name`}
              type="text"
              name="alternate_contact_name"
              maxLength={45}
              value={form.alternate_contact_name}
              onChange={handleInputChange}
              onPaste={handlePasteCapture("alternate_contact_name")}
              placeholder={t(
                "registrationPage.form.altContactNamePlaceholder",
                "Relative / Parent contact",
              )}
              className={inputCls("alternate_contact_name")}
              aria-invalid={Boolean(fieldErrors.alternate_contact_name)}
            />
          </Field>

          <Field
            id={`${baseId}-alt-mobile`}
            label={t(
              "registrationPage.form.altContactMobileLabel",
              "Alternate Contact Mobile",
            )}
            required
            error={fieldErrors.alternate_mobile_no}
          >
            <Input
              id={`${baseId}-alt-mobile`}
              type="tel"
              name="alternate_mobile_no"
              maxLength={10}
              value={form.alternate_mobile_no}
              onChange={handleNumericInput}
              onPaste={handlePasteCapture("alternate_mobile_no")}
              placeholder={t(
                "registrationPage.form.altContactMobilePlaceholder",
                "10-digit mobile number",
              )}
              className={inputCls("alternate_mobile_no")}
              aria-invalid={Boolean(fieldErrors.alternate_mobile_no)}
            />
          </Field>
        </div>
      </div>
    </FormSection>
  );
}
