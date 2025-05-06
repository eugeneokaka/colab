// import { AuthForm } from "@/components/auth-form";
import { AuthForm } from "../components/auth";
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Log in to Colab</h1>
        <AuthForm type="login" />
        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-indigo-600 underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
