"use client";
import { useForm } from "react-hook-form";
import { Card } from "@heroui/react";

import { AppInput, AppButton } from "../ui";

export const AuthForm = ({ type = "login", onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const isLogin = type === "login";

  return (
    <Card className="max-w-md w-full p-6 mx-auto">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {!isLogin && (
          <AppInput
            label="Full Name"
            placeholder="Enter your name"
            {...register("name", { required: !isLogin })}
          />
        )}

        <AppInput
          label="Email"
          placeholder="you@example.com"
          type="email"
          {...register("email", { required: true })}
        />

        <AppInput
          label="Password"
          placeholder="••••••••"
          type="password"
          {...register("password", { required: true })}
        />

        <AppButton fullWidth color="primary" type="submit">
          {isLogin ? "Login" : "Sign Up"}
        </AppButton>
      </form>
    </Card>
  );
};
