import { AuthPage } from "@refinedev/antd";
import { authCredentials } from "../../providers";
import { authCredentials as myAuthCredentials } from "@/my-providers/auth";
export const Login = () => {
  return (
    <AuthPage
      type="login"
      formProps={{
        initialValues: myAuthCredentials,
      }}
    />
  );
};
