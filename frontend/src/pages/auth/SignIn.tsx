import { useState } from "react";
import { useNavigate } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import AuthLayout from "./AuthPageLayout";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { useTenant } from "../../context/TenantContext";
import PageMeta from "../../components/common/PageMeta";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { tenantType, village } = useTenant();

  const isVillage = tenantType === "village";
  const isSuperadmin = tenantType === "superadmin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await authService.login(email, password);
      const { user, accessToken, refreshToken } = result.data;
      setAuth(user, accessToken, refreshToken);
      // Redirect based on tenant type
      if (isVillage) {
        navigate("/admin/");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const panelTitle = isVillage
    ? `ग्रामपंचायत ${village?.name || ""} - प्रशासन`
    : isSuperadmin
    ? "GPMH Super Admin"
    : "Admin Panel";

  const panelSubtitle = isVillage
    ? "ग्रामपंचायत प्रशासन पॅनेलमध्ये लॉगिन करा"
    : "Enter your email and password to sign in";

  return (
    <>
      <PageMeta
        title={isVillage ? `लॉगिन | ग्रामपंचायत ${village?.name || ""}` : "Sign In | GPMH Admin"}
        description={isVillage ? "ग्रामपंचायत प्रशासन लॉगिन" : "Sign in to GPMH Admin"}
      />
      <AuthLayout>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div className="mb-5 sm:mb-8">
                {isVillage && (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-500/30 mb-4">
                    {village?.name?.charAt(0) || "ग्रा"}
                  </div>
                )}
                <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  {isVillage ? "लॉगिन" : "Sign In"}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {panelSubtitle}
                </p>
                {isVillage && (
                  <p className="text-xs text-orange-500 mt-1 font-medium">
                    {panelTitle}
                  </p>
                )}
              </div>
              <div>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-error-50 dark:bg-error-500/15 text-error-600 dark:text-error-400 text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <Label>
                        Email <span className="text-error-500">*</span>
                      </Label>
                      <Input
                        placeholder="admin@platform.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                      />
                    </div>
                    <div>
                      <Label>
                        Password <span className="text-error-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                        >
                          {showPassword ? (
                            <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                          ) : (
                            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                          )}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Button
                        className="w-full"
                        size="sm"
                        disabled={isLoading}
                      >
                        {isLoading
                          ? (isVillage ? "लॉगिन होत आहे..." : "Signing in...")
                          : (isVillage ? "लॉगिन करा" : "Sign in")}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
