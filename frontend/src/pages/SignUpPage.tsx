import { SignUp } from "@clerk/react";

export default function SignUpPage() {
  return (
    <div className="auth-viewport">
      <div className="clerk-auth-wrapper">
        <SignUp
          signInUrl="/sign-in"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
