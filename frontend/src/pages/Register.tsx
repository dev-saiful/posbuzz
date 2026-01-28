import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

// Brand Icon SVG
const BrandIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      await register(values.name, values.email, values.password, values.confirmPassword);
      message.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand-logo">
              <BrandIcon />
            </div>
            <div className="auth-brand-name">
              POS<span>Buzz</span>
            </div>
          </div>

          {/* Title */}
          <p className="auth-title">Create your account</p>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="auth-form"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email address"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please enter a valid email",
                },
              ]}
            >
              <Input placeholder="you@example.com" autoComplete="email" />
            </Form.Item>

            <Form.Item
              name="name"
              label="Full name"
              rules={[
                {
                  required: true,
                  message: "Please enter your name",
                },
              ]}
            >
              <Input placeholder="John Doe" autoComplete="name" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please enter a password",
                },
                {
                  min: 8,
                  message: "Password must be at least 8 characters",
                },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
                  message:
                    "Password must contain uppercase, lowercase, number, and special character (@$!%*?&)",
                },
              ]}
            >
              <Input.Password
                placeholder="Enter password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Create account
              </Button>
            </Form.Item>
          </Form>

          {/* Footer */}
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
