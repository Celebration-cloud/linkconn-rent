"use client";

import { useForm } from "react-hook-form";
import { Button, Input, Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

import { authClient } from "@/lib/auth/client";
import { showToast } from "@/components/ui/Toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Neon Auth token

  console.log("Reset Token:", token); // Debugging line
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ password }) => {
    if (!token) {
      showToast({ title: "Invalid or missing token", type: "error" });

      return;
    }

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) throw error;

      showToast({ title: "Password reset successful", type: "success" });
      router.push("/auth/login");
    } catch (err) {
      showToast({
        title: "Reset failed",
        description: err.message,
        type: "error",
      });
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
      initial={{ opacity: 0, y: 25 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center mb-6 text-center">
        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <p className="text-default-500 text-sm">
          Enter your new password to update your account.
        </p>
      </div>

      <Card className="border-none shadow-lg bg-content1">
        <CardBody>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              {...register("password", {
                required: "Password is required",
                minLength: 6,
              })}
              errorMessage={errors.password?.message}
              isInvalid={!!errors.password}
              label="New Password"
              type="password"
              variant="bordered"
            />

            <Button color="primary" size="lg" type="submit" variant="shadow">
              Update Password
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
}
