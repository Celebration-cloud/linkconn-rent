"use client";
import { useForm } from "react-hook-form";
import { AppInput, AppButton } from "../ui";
import { Card } from "@heroui/react";

export const AuthForm = ({ type = "login", onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const isLogin = type === "login";

  return (
    <Card className="max-w-md w-full p-6 mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isLogin && (
          <AppInput
            label="Full Name"
            placeholder="Enter your name"
            {...register("name", { required: !isLogin })}
          />
        )}

        <AppInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          {...register("email", { required: true })}
        />

        <AppInput
          label="Password"
          type="password"
          placeholder="••••••••"
          {...register("password", { required: true })}
        />

        <AppButton type="submit" color="primary" fullWidth>
          {isLogin ? "Login" : "Sign Up"}
        </AppButton>
      </form>
    </Card>
  );
};
