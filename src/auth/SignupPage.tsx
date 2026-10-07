import { SignupForm } from "wasp/client/auth";
import { Link } from "wasp/client/router";

export function SignupPage() {
  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <SignupForm />
      <p>
        Уже есть аккаунт? <Link to="/login">Вход</Link>
      </p>
    </div>
  );
}
