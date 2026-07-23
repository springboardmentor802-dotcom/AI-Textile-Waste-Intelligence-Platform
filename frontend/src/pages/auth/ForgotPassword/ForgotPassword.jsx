import { Link } from "react-router-dom";

import AuthLayout from "../../../layouts/AuthLayout";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

function ForgotPassword() {
  return (
    <AuthLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="text-center">
          <h2
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Forgot Password?
          </h2>

          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Enter your registered email address and we'll send you a password reset link.
          </p>
        </div>

        <Input
          id="email"
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          required
        />

        <Button>
          Send Reset Link
        </Button>

        <div className="text-center text-sm">
          <span style={{ color: "var(--text-secondary)" }}>
            Remember your password?
          </span>

          <Link
            to="/login"
            className="ml-2 font-semibold"
            style={{ color: "var(--primary)" }}
          >
            Back to Login
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;