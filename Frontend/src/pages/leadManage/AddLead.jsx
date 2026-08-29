import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, AlertCircle, Loader2, User, Mail, Phone, Radio, FileText } from "lucide-react";
import { LEAD_SOURCES } from "../../lib/Utils";
import { createLead } from "../../services/api.services";
import Constant from "../../lib/Constant";
import CustomDropdown from "../../component/CustomDropdown";

const inputClass = (hasError) =>
  `w-full text-sm px-3.5 py-2.5 rounded-lg border outline-none transition ${
    hasError ? "border-red-500" : "border-border focus:border-primary"
  }`;

function ErrorText({ message }) {
  if (!message) return null;
  return (
    <span className="flex items-center gap-1 text-xs mt-1.5 text-red-600">
      <AlertCircle size={12} /> {message}
    </span>
  );
}

export default function AddLead() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", email: "", phone: "", source: "", description: "", status: "new" },
    mode: "onBlur",
  });

  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/\D/g, "").slice(0, 10);
    setValue("phone", onlyNums, { shouldValidate: true });
  };

  async function onSubmit(data) {
    const authData = JSON.parse(localStorage.getItem(Constant.AUTH_KEY) || "{}");
    const userId = authData.id || 1;

    const payload = {
      user_id: Number(userId),
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      source: data.source,
      description: data.description ? data.description.trim() : "",
      status: "new",
    };

    try {
      const res = await createLead(payload);
      if (res?.code === Constant.CREATED || res?.code === Constant.OK) {
        toast.success(res?.message || "Lead created successfully");
        navigate("/leads");
      } else if (res?.code === Constant.VALIDATION_ERROR) {
        toast.error(res?.message || "Validation failed");
      } else {
        toast.error(res?.message || "Failed to create lead");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  }

  const sourceOptions = LEAD_SOURCES.map((s) => ({ label: s, value: s }));

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm mb-6 text-ink-muted hover:text-ink transition cursor-pointer"
        >
          <ChevronLeft size={15} /> Back
        </button>

        <div className="text-center mb-7">
          <h1 className="font-semibold text-2xl text-ink">New Lead</h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-7 rounded-2xl bg-surface border border-border shadow-sm space-y-5"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">Contact details</p>
            <div className="grid sm:grid-cols-2 gap-4">

              <label className="block">
                <span className="text-sm font-medium mb-1.5 block text-ink">
                  Full Name <span className="text-red-600">*</span>
                </span>
                <input
                  type="text"
                  {...register("name", {
                    required: "Full Name is required",
                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                  })}
                  placeholder="Enter Full Name"
                  className={inputClass(errors.name)}
                />
                <ErrorText message={errors.name?.message} />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1.5 block text-ink">
                  Phone Number <span className="text-red-600">*</span>
                </span>
                <input
                  type="text"
                  maxLength={10}
                  {...register("phone", {
                    required: "Phone Number is required",
                    minLength: { value: 10, message: "Phone Number must be exactly 10 digits" },
                    maxLength: { value: 10, message: "Phone Number must be exactly 10 digits" },
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Only 10-digit numbers allowed",
                    },
                  })}
                  onChange={handlePhoneChange}
                  placeholder="Enter Phone Number"
                  className={inputClass(errors.phone)}
                />
                <ErrorText message={errors.phone?.message} />
              </label>
            </div>

            {/* Email */}
            <label className="block mt-4">
              <span className="text-sm font-medium mb-1.5 block text-ink">
                Email Address <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                {...register("email", {
                  required: "Email Address is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                placeholder="Enter Email Address"
                className={inputClass(errors.email)}
              />
              <ErrorText message={errors.email?.message} />
            </label>
          </div>

          <div className="h-px bg-border" />

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted mb-3">Lead details</p>

            <label className="block">
              <span className="text-sm font-medium mb-1.5 block text-ink">
                Source <span className="text-red-600">*</span>
              </span>
              <Controller
                name="source"
                control={control}
                rules={{ required: "Source is required" }}
                render={({ field }) => (
                  <CustomDropdown
                    options={sourceOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter Source"
                    error={!!errors.source}
                  />
                )}
              />
              <ErrorText message={errors.source?.message} />
            </label>

            <label className="block mt-4">
              <span className="text-sm font-medium mb-1.5 block text-ink">Description</span>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Enter Description"
                className={`${inputClass(false)} resize-y`}
              />
            </label>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : "Create Lead"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-sm font-medium px-5 py-2.5 rounded-lg border border-border text-ink hover:bg-canvas transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}