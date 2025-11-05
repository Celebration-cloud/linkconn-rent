"use client";

import { useForm } from "react-hook-form";
import { Button, Input, Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState } = useForm();

  const onSubmit = (data) => {
    console.log("Forgot password:", data);
    // TODO: integrate backend reset-password email API
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-6 text-center">
        <Mail className="w-10 h-10 text-primary mb-3" />
        <h2 className="text-2xl font-semibold">Forgot Password</h2>
        <p className="text-default-500 text-sm">
          Enter your email to receive a password reset link.
        </p>
      </div>

      {/* Form */}
      <Card className="border-none shadow-lg bg-content1">
        <CardBody>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              {...register("email", { required: true })}
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              variant="bordered"
              isInvalid={!!formState.errors.email}
              errorMessage="Email is required"
            />

            <Button type="submit" color="primary" variant="shadow" size="lg">
              Send Reset Link
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Links */}
      <div className="mt-6 text-center text-sm">
        <Link href="/auth/login" className="text-primary font-medium">
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}
