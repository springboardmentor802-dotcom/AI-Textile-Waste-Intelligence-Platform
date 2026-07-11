import Input from "../ui/Input";
import Button from "../ui/Button";

function LoginForm() {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">

      <h2 className="text-3xl font-bold text-center mb-2">
        Welcome Back
      </h2>

      <p className="text-gray-500 text-center mb-8">
        Login to continue
      </p>

      <form>

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
        />

        <Button>
          Login
        </Button>

      </form>

      <p className="text-center mt-8">

        Don't have an account?

        <span className="text-green-700 font-semibold cursor-pointer">

          {" "}Register

        </span>

      </p>

    </div>
  );
}

export default LoginForm;