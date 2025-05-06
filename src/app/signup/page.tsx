import { AuthForm } from "../components/auth";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Create your Colab account
        </h1>
        <AuthForm type="signup" />
        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-indigo-600 underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
