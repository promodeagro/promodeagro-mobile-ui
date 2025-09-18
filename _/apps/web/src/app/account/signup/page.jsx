import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("email"); // 'email', 'phone', 'otp'
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const { signUpWithCredentials, signInWithGoogle, signInWithFacebook } = useAuth();

  // Format phone number for display
  const formatPhoneNumber = (input) => {
    const digits = input.replace(/\D/g, "");
    if (digits.length <= 10) {
      return digits.replace(/(\d{5})(\d{0,5})/, "$1 $2").trim();
    }
    return digits.slice(0, 10).replace(/(\d{5})(\d{5})/, "$1 $2");
  };

  const validatePhoneNumber = (phoneNumber) => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    return /^[6-9]\d{9}$/.test(cleanPhone);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !name) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-up. Please try again or use a different method.",
        OAuthCallback: "Sign-up failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-up option. Try another one.",
        EmailCreateAccount:
          "This email can't be used. It may already be registered.",
        Callback: "Something went wrong during sign-up. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Invalid email or password. If you already have an account, try signing in instead.",
        AccessDenied: "You don't have permission to sign up.",
        Configuration:
          "Sign-up isn't working right now. Please try again later.",
        Verification: "Your sign-up link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!validatePhoneNumber(phone)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          action: "send",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStep("otp");
        setTimer(60);
        setCanResend(false);
        
        // In development, show OTP in error for easy access
        if (process.env.NODE_ENV === "development" && result.otp) {
          setError(`Development OTP: ${result.otp}`);
        }
      } else {
        setError(result.error || "Failed to send OTP");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          otp: otpString,
          action: "verify",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Successful OTP verification - redirect to home
        window.location.href = "/";
      } else {
        setError(result.error || "Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === 6) {
      setTimeout(() => handleVerifyOTP(), 500);
    }
  };

  const handleSocialSignUp = async (provider) => {
    try {
      if (provider === "google") {
        await signInWithGoogle();
      } else if (provider === "facebook") {
        await signInWithFacebook();
      }
    } catch (err) {
      setError("Social sign-up failed. Please try again.");
    }
  };

  // Timer effect for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    } else if (timer === 0 && step === "otp") {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-green-100">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Join Promode Agro
          </h1>
          <p className="text-gray-600">
            Fresh organic produce delivered to your door
          </p>
        </div>

        {step === "email" && (
          <div className="space-y-6">
            {/* Signup Method Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                className="flex-1 py-3 px-4 text-sm font-semibold rounded-lg bg-white text-green-600 shadow-sm transition-all"
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="flex-1 py-3 px-4 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-700 transition-all"
              >
                Phone
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all">
                  <input
                    required
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-transparent text-lg outline-none placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all">
                  <input
                    required
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-transparent text-lg outline-none placeholder-gray-400"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all">
                  <input
                    required
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg bg-transparent text-lg outline-none placeholder-gray-400"
                    placeholder="Enter your password (min. 6 characters)"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-green-600 px-4 py-4 text-lg font-semibold text-white transition-all hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center justify-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">or continue with</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialSignUp("google")}
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#DB4437"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignUp("facebook")}
                className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Facebook
                </span>
              </button>
            </div>

            {/* Terms Section for Email mode */}
            <div className="text-center pt-4 border-t border-gray-200 mt-6">
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our Terms of Service and
                Privacy Policy
              </p>
            </div>
          </div>
        )}

        {step === "phone" && (
          <div className="space-y-6">
            {/* Signup Method Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="flex-1 py-3 px-4 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-700 transition-all"
              >
                Email
              </button>
              <button
                type="button"
                className="flex-1 py-3 px-4 text-sm font-semibold rounded-lg bg-white text-green-600 shadow-sm transition-all"
              >
                Phone
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Mobile Number
              </label>
              <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-4 py-3 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-200 transition-all">
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-700 mr-3">+91</span>
                  <input
                    type="tel"
                    value={formatPhoneNumber(phone)}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter mobile number"
                    maxLength={11}
                    className="flex-1 bg-transparent text-lg outline-none placeholder-gray-400"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You'll receive an OTP to verify your number. No password required!
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              onClick={handleSendOTP}
              disabled={loading || !validatePhoneNumber(phone)}
              className="w-full rounded-xl bg-green-600 px-4 py-4 text-lg font-semibold text-white transition-all hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Enter OTP</h2>
              <p className="text-gray-600">
                We've sent a 6-digit code to<br />
                <span className="font-semibold text-gray-800">+91 {formatPhoneNumber(phone)}</span>
              </p>
            </div>

            <div className="flex justify-center space-x-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  name={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOTPChange(e.target.value, index)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !digit && index > 0) {
                      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
                      if (prevInput) prevInput.focus();
                    }
                  }}
                  maxLength={1}
                  className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.some((digit) => digit === "")}
              className="w-full rounded-xl bg-green-600 px-4 py-4 text-lg font-semibold text-white transition-all hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? "Verifying..." : "Verify & Create Account"}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-500">
                  Resend OTP in {timer}s
                </p>
              ) : (
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp(["", "", "", "", "", ""]);
                    setError(null);
                  }}
                  className="text-sm text-green-600 hover:text-green-700 font-semibold"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setStep("phone");
                setOtp(["", "", "", "", "", ""]);
                setError(null);
              }}
              className="w-full text-center text-gray-500 hover:text-gray-700 text-sm font-medium py-2"
            >
              ← Change Number
            </button>
          </div>
        )}

        {/* Always show this link regardless of step */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href={`/account/signin${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;