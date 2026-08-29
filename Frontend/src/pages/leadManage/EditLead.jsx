import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { getLeadDetails, updateLead } from "../../services/api.services";
import { LEAD_SOURCES, STATUS_META, getCleanPhoneDigits } from "../../lib/Utils";
import CustomDropdown from "../../component/CustomDropdown";
import Constant from "../../lib/Constant";

export default function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [initialData, setInitialData] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", email: "", phone: "", source: "", description: "", status: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    async function fetchLead() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await getLeadDetails(id);

        // Check if response has data property or if res itself is the object
        const lead = res?.data || (res?.id ? res : null);

        if (lead && lead.name) {
          const fetched = {
            name: lead.name || "",
            email: lead.email || "",
            phone: getCleanPhoneDigits(lead.phone),
            source: lead.source || "",
            description: lead.description || "",
            status: lead.status || "new",
          };
          setInitialData(fetched);
          reset(fetched);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchLead();
    }
  }, [id, reset]);

  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setValue("phone", onlyDigits, { shouldValidate: true, shouldDirty: true });
  };

  const onSubmit = async (data) => {
    const patchPayload = {};

    Object.keys(data).forEach((key) => {
      if (data[key] !== initialData[key]) {
        patchPayload[key] = data[key];
      }
    });

    if (Object.keys(patchPayload).length === 0) {
      toast.info("No changes made.");
      navigate(-1);
      return;
    }

    try {
      const response = await updateLead(id, patchPayload);

      if (response?.code === Constant.OK) {
        toast.success(response.message || "Lead updated successfully");
        navigate(-1);
      } else {
        toast.error(response?.message || "Failed to update lead");
      }
    } catch (err) {
      toast.error("Error updating lead");
    }
  };

  const sourceOptions = LEAD_SOURCES.map((s) => ({ label: s, value: s }));
  const statusOptions = Object.entries(STATUS_META).map(([key, val]) => ({
    label: val.label,
    value: key,
    dot: val.dot,
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border rounded-xl">
        <Loader2 className="animate-spin text-primary mb-2" size={24} />
        <p className="text-xs text-ink-muted">Loading details.</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-20 bg-surface border border-border rounded-xl">
        <h2 className="text-lg font-semibold text-ink mb-2">Lead Details Not Found</h2>
        <Link
          to="/leads"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors"
        >
          <ChevronLeft size={16} /> Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm mb-6 text-ink-muted hover:text-ink transition-colors cursor-pointer"
        >
          <ChevronLeft size={15} /> Back
        </button>

      <div className="mb-6">
        <h1 className="font-semibold text-2xl text-ink">Edit Lead</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-surface border border-border p-6 rounded-2xl shadow-sm">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name", { required: "Name is required" })}
            placeholder="Enter Full Name"
            className={`w-full text-sm p-3 rounded-lg border outline-none transition ${
              errors.name ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
            }`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              placeholder="Enter Email Address"
              className={`w-full text-sm p-3 rounded-lg border outline-none transition ${
                errors.email ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("phone", {
                required: "Phone is required",
                minLength: { value: 10, message: "Phone number must be 10 digits" },
              })}
              onChange={handlePhoneChange}
              maxLength={10}
              placeholder="Enter Phone Number"
              className={`w-full text-sm p-3 rounded-lg border outline-none transition font-mono ${
                errors.phone ? "border-red-400 focus:border-red-500" : "border-border focus:border-primary"
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
              Lead Source <span className="text-red-500">*</span>
            </label>
            <Controller
              name="source"
              control={control}
              rules={{ required: "Source is required" }}
              render={({ field }) => (
                <CustomDropdown
                  options={sourceOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter Lead Source"
                />
              )}
            />
            {errors.source && <p className="text-xs text-red-500 mt-1">{errors.source.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field }) => (
                <CustomDropdown
                  options={statusOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter Status"
                />
              )}
            />
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
            Description / Requirements
          </label>
          <textarea
            {...register("description")}
            placeholder="Enter Description"
            rows={4}
            className="w-full text-sm p-3 rounded-lg border border-border outline-none focus:border-primary transition resize-y"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm font-medium text-ink bg-transparent hover:bg-canvas rounded-lg transition-colors cursor-pointer border border-border"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}