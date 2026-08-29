import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { login } from "../services/api.services";
import Constant from "../lib/Constant";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  async function onSubmit(data) {
    setLoading(true);
    try {
      const response = await login({ email: data.email, password: data.password });

      if (response?.code === Constant.OK) {
        const { id, email: userEmail } = response.data;
        localStorage.setItem(Constant.LOGIN_KEY, "true");
        localStorage.setItem(Constant.AUTH_KEY, JSON.stringify({ id, email: userEmail }));
        toast.success(response.message || "Login successful");
        navigate("/");
      } else if (response?.code == Constant.BAD_REQUEST) {
        toast.error(response.message || "Invalid request");
      } else if (response?.code == Constant.UNAUTHORIZED) {
        toast.error(response.message || "Invalid email or password");
      } else if (response?.code == Constant.NOT_FOUND) {
        toast.error(response.message || "User not found");
      } else if (response?.code == Constant.INTERNAL_SERVER_ERROR) {
        toast.error(response.message || "Server error. Please try again later.");
      } else {
        toast.error(response?.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-canvas">
      <div className="hidden lg:flex lg:w-[45%] bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-sidebar" />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="LeadTrack Logo" className="w-9 h-9 rounded-lg" />
            <h2 className="text-2xl font-bold tracking-tight">LeadTrack</h2>
          </div>
          <div className="mb-16">
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Manage your leads 
            </h1>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute top-20 -right-10 w-40 h-40 bg-white/5 rounded-full" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
            <p className="text-sm text-ink-muted mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-ink mb-1.5 block">Email</label>
              <input
                type="text"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                placeholder="Enter Email"
                className={`w-full text-sm px-3.5 py-2.5 rounded-lg border outline-none transition ${errors.email ? "border-red-400" : "border-border focus:border-primary"
                  }`}
              />
              {errors.email && (
                <span className="flex items-center gap-1 text-xs mt-1.5 text-red-600">
                  <AlertCircle size={12} /> {errors.email.message}
                </span>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="Enter Password"
                  className={`w-full text-sm px-3.5 pr-10 py-2.5 rounded-lg border outline-none transition ${errors.password ? "border-red-400" : "border-border focus:border-primary"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-ink-muted hover:text-ink cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span className="flex items-center gap-1 text-xs mt-1.5 text-red-600">
                  <AlertCircle size={12} /> {errors.password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-sm font-semibold py-2.5 rounded-lg text-white bg-primary hover:bg-primary-hover transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Sign in"}
            </button>
          </form>

          <p className="text-center text-xs text-ink-muted mt-8">
            Don't have an account? <button className="text-primary font-medium ">Contact admin</button>
          </p>
        </div>
      </div>
    </div>
  );
}