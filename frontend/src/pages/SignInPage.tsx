import { SignIn } from "@clerk/react";

export default function SignInPage() {
  return (
    <div className="auth-viewport">
      <div className="clerk-auth-wrapper">
        <SignIn
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
