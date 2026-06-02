"use client";

import { useForm } from "react-hook-form";
import { Button, Input, Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "@/lib/redux/slices/userSlice";
import { useEffect, useState } from "react";

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);

  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = ({ email }) => {
    if (cooldown > 0) return;
    dispatch(forgotPassword(email));
    setCooldown(60);
  };

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="flex flex-col items-center mb-6 text-center">
        <Mail className="w-10 h-10 text-primary mb-3" />
        <h2 className="text-2xl font-semibold">Forgot Password</h2>
        <p className="text-default-500 text-sm">
          Enter your email to receive a password reset link.
        </p>
      </div>
      <Card className="border-none shadow-lg bg-content1">
        <CardBody>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              {...register("email", { required: "Email is required" })}
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              variant="bordered"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              isDisabled={cooldown > 0}
            />

            <Button
              type="submit"
              color="primary"
              variant="shadow"
              size="lg"
              isLoading={loading}
              isDisabled={cooldown > 0}
            >
              {cooldown > 0 ? `Wait ${cooldown}s` : "Send Reset Link"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="mt-6 text-center text-sm">
        <Link href="/auth/login" className="text-primary font-medium">
          Back to Login
        </Link>
      </div>
    </motion.div>
  );
}