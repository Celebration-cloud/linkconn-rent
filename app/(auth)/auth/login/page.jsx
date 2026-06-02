"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/zodSchemas";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/lib/redux/slices/userSlice";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Image as HeroImage,
} from "@heroui/react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);
  const router = useRouter();
  const [role, setRole] = useState("tenant");

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "tenant",
    },
  });

const onSubmit = (data) => {
  dispatch(loginUser(data)).then((res) => {
    if (!res.error && res.payload?.user) {
      const userData = res.payload;
      router.push(
        userData.user.onboarded
          ? `/dashboard/${userData.user.role}`
          : `/onboarding/${userData.user.role}`
      );
    }
  });
};


  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="flex flex-col items-center mb-6">
        <HeroImage
          src="https://eqmwsmfbuwvauqlbexau.supabase.co/storage/v1/object/public/Linkconn%20Rent/ChatGPT%20Image%20Oct%2025,%202025,%2007_27_10%20AM.png"
          alt="LinkConn Rent Logo"
          width={80}
          height={80}
          radius="none"
        />
        <h2 className="text-2xl font-semibold mt-3">Welcome Back</h2>
        <p className="text-default-500 text-sm text-center">
          Log in to manage your rentals, tenants, or listings.
        </p>
      </div>

      <Card className="bg-card border border-default-200/50 shadow-xl">
        <CardBody>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              {...register("email")}
              label="Email Address"
              placeholder="Enter your email"
              type="email"
              variant="bordered"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
            />

            <Input
              {...register("password")}
              label="Password"
              placeholder="••••••••"
              type="password"
              variant="bordered"
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
            />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  label="Account Type"
                  selectedKeys={new Set([field.value])}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0];
                    setRole(selected);
                    field.onChange(selected);
                  }}
                >
                  <SelectItem key="landlord">Landlord</SelectItem>
                  <SelectItem key="tenant">Tenant</SelectItem>
                </Select>
              )}
            />

            <Button
              type="submit"
              color="primary"
              variant="shadow"
              size="lg"
              startContent={<LogIn className="w-4 h-4" />}
              isLoading={loading}
            >
              Log In
            </Button>
          </form>
        </CardBody>
      </Card>

      <div className="mt-4 text-center">
        <Link
          href="/auth/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <p className="text-center text-sm mt-4">
        Don’t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-primary font-medium hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </motion.div>
  );
}
