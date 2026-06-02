"use client";

import { useForm } from "react-hook-form";
import { Button, Input, Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { showToast } from "@/components/ui/Toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("access_token"); // Supabase recovery token

  console.log("Access Token:", accessToken); // Debugging line
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ password }) => {
    if (!accessToken) {
      showToast({ title: "Invalid link", type: "error" });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser(
        {
          password,
        },
        { accessToken }
      );

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
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
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
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              {...register("password", {
                required: "Password is required",
                minLength: 6,
              })}
              label="New Password"
              type="password"
              variant="bordered"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
            />

            <Button type="submit" color="primary" variant="shadow" size="lg">
              Update Password
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
}
