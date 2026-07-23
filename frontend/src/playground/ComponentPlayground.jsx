import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";

import { Mail, Search } from "lucide-react";
function App() {
  return (
    <div
      className="min-h-screen flex justify-center items-center gap-10"
      style={{
        background: "var(--background)",
      }}
    >
      {/* Button Demo */}
      <div className="flex flex-col gap-4">
        <Button>Login</Button>

        <Button variant="secondary">
          Cancel
        </Button>

        <Button variant="danger">
          Delete
        </Button>

        <Button variant="outline">
          View
        </Button>
      </div>

      {/* Input Demo */}
      <div className="w-96 flex flex-col gap-6">
        <Input
          label="Email"
          placeholder="Enter your email"
          helperText="We'll never share your email."
        />

    
        <Input
    label="Email"
    placeholder="Enter your email"
    leftIcon={<Mail size={18} />}
/>

<Input
    label="Search"
    placeholder="Search textiles..."
    leftIcon={<Search size={18} />}
/>

<PasswordInput
    id="password"
    name="password"
    label="Password"
    placeholder="Enter your password"
    error="Password is required"
/>
      </div>
    </div>
  );
}

export default App;