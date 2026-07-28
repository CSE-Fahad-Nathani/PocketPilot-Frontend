import { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";

import TextInput from "../components/TextInput";
import useAuthStore from "../store/authStore";
import { wakeServer } from "../utils/wakeServer";

const Login = () => {
  const { login, error, clearError } = useAuthStore();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    wakeServer();
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    clearError();
    setSubmitting(true);

    const result = login(userId, password);

    if (!result.success) {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#10002b] px-5 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[#5a189a]/30 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-[#7b2cbf]/25 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#240046]/80 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7b2cbf] to-[#3c096c] shadow-[0_0_28px_rgba(157,78,221,0.4)]">
            <span className="text-lg font-bold text-white">PP</span>
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#9d4edd]">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            PocketPilot
          </h1>
          <p className="mt-2 text-sm text-[#c77dff]">
            Sign in to continue managing your cycle.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#e0aaff1f] bg-[#240046]/90 p-5 shadow-[0_20px_60px_rgba(16,0,43,0.55)] backdrop-blur-sm"
        >
          <div className="relative">
            <FiUser
              size={14}
              className="pointer-events-none absolute left-3 top-[38px] z-10 text-[#9d4edd]"
            />
            <div className="[&_input]:pl-9">
              <TextInput
                compact
                label="User ID"
                name="userId"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => {
                  clearError();
                  setUserId(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="relative">
            <FiLock
              size={14}
              className="pointer-events-none absolute left-3 top-[38px] z-10 text-[#9d4edd]"
            />
            <div className="[&_input]:pl-9 [&_input]:pr-10">
              <TextInput
                compact
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  clearError();
                  setPassword(e.target.value);
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-[34px] text-[#9d4edd] transition hover:text-[#c77dff]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>

          {error ? (
            <p className="mb-3 rounded-xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-xs text-[#fca5a5]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || !userId.trim() || !password}
            className="mt-1 w-full rounded-2xl bg-gradient-to-r from-[#5a189a] to-[#7b2cbf] py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
