import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "../Input";

function PasswordInput(props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      type={showPassword ? "text" : "password"}
      rightIcon={
        showPassword ? (
          <EyeOff
            size={18}
            onClick={() => setShowPassword(false)}
          />
        ) : (
          <Eye
            size={18}
            onClick={() => setShowPassword(true)}
          />
        )
      }
    />
  );
}

export default PasswordInput;