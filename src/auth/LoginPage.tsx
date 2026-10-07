import { LoginForm } from "wasp/client/auth";
import { Link } from "wasp/client/router";

export function LoginPage() {
  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <LoginForm />
      <p>
        Нет аккаунта? <Link to="/signup">Регистрация</Link>
      </p>
    </div>
  );
}
