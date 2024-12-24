import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { useRegister } from "@refinedev/core";
import { Form, Input, Button, Card } from "antd";
import { CreateResponse } from "@refinedev/core";

type RegisterVariables = {
  email: string;
  password: string;
  name: string;
};

export const Register: React.FC = () => {
  const { mutate: register, isLoading , error } = useRegister<RegisterVariables>();
  
  const { formProps, saveButtonProps, onFinish } = useForm<RegisterVariables>({
    onMutationSuccess: (data : CreateResponse<RegisterVariables>) => {
      console.log(data);
      register(data.data);
    },
  });

  const handleSubmit = (data : any) => {
    console.log(data);
    register(data);
  };

  return (
    // <Create saveButtonProps={saveButtonProps}>
    <Card title="Register" style={{ maxWidth: 400, margin: "auto" , marginTop : "10%" }}>
      <Form {...formProps} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Email is required" },
            { type: "email", message: "Please enter a valid email" }
          ]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Password is required" },
            { min: 6, message: "Password must be at least 6 characters" }
          ]}
        >
          <Input.Password />
        </Form.Item>
        
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}

          >
            Register
          </Button>
        </Form.Item>
      </Form>
    </Card>
    // </Create>
  );
};