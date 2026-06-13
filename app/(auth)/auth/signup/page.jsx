"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Image as HeroImage,
  Link,
} from "@heroui/react";
import { UserPlus, FileImage, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { signupUser } from "@/lib/redux/slices/userSlice";
import { signupSchema } from "@/lib/zodSchemas";
import { runWorker, uploadFile } from "@/lib/puterClient";

export default function SignupPage() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);
  const router = useRouter();
  const [role, setRole] = useState("tenant");

  const { control, handleSubmit, register, formState } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "tenant" },
  });

  useEffect(() => {
    async function init() {
      const res = await runWorker("setupUserTable");

      console.log("Worker done:", res);
    }
    init();
  }, []);

  const onSubmit = async (data) => {
    const formData = new FormData();
    let profilePicURL = null;

    if (data.profilePic?.[0]) {
      const file = data.profilePic[0];
      const path = `users/${Date.now()}_${file.name}`;

      try {
        const { url } = await uploadFile({ path, file });

        profilePicURL = url;
      } catch (err) {
        console.error("Profile pic upload failed:", err.message);
      }
    }

    Object.entries(data).forEach(([key, value]) => {
      if (key === "profilePic") return;
      formData.append(key, value);
    });

    if (profilePicURL) formData.append("profile_pic", profilePicURL);

    dispatch(signupUser(formData)).then((res) => {
      if (!res.error) {
        if (res.payload?.needsVerification) {
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(data.email)}`,
          );
        } else {
          router.push("/dashboard");
        }
      }
    });
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 25 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center mb-6">
        <HeroImage
          alt="LinkConn Rent Logo"
          height={80}
          radius="none"
          src="https://eqmwsmfbuwvauqlbexau.supabase.co/storage/v1/object/public/Linkconn%20Rent/ChatGPT%20Image%20Oct%2025,%202025,%2007_27_10%20AM.png"
          width={80}
        />
        <h1 className="text-2xl font-bold mt-3">Create Your Account</h1>
      </div>

      <Card className="bg-card border border-default-200/50 shadow-xl">
        <CardBody>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Input
              {...register("fullName")}
              errorMessage={formState.errors.fullName?.message}
              isInvalid={!!formState.errors.fullName}
              label="Full Name"
              placeholder="Enter your full name"
              variant="bordered"
            />

            <Input
              {...register("email")}
              errorMessage={formState.errors.email?.message}
              isInvalid={!!formState.errors.email}
              label="Email"
              placeholder="Enter your email"
              type="email"
              variant="bordered"
            />

            <Input
              {...register("password")}
              errorMessage={formState.errors.password?.message}
              isInvalid={!!formState.errors.password}
              label="Password"
              placeholder="••••••••"
              type="password"
              variant="bordered"
            />

            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  label="Account Type"
                  selectedKeys={[field.value]}
                  onChange={(e) => {
                    setRole(e.target.value);
                    field.onChange(e.target.value);
                  }}
                >
                  <SelectItem key="landlord">Landlord</SelectItem>
                  <SelectItem key="tenant">Tenant</SelectItem>
                </Select>
              )}
            />

            {role === "landlord" && (
              <Input
                {...register("companyName")}
                errorMessage={formState.errors.companyName?.message}
                isInvalid={!!formState.errors.companyName}
                label="Company Name"
                placeholder="Enter your company name"
                variant="bordered"
              />
            )}

            <Input
              {...register("address")}
              errorMessage={formState.errors.address?.message}
              isInvalid={!!formState.errors.address}
              label="Address"
              placeholder="Enter your address"
              variant="bordered"
            />

            <Controller
              control={control}
              name="profilePic"
              render={({ field }) => (
                <Input
                  label="Profile Picture"
                  startContent={<FileImage className="w-4 h-4" />}
                  type="file"
                  variant="flat"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              )}
            />

            <Button
              color="primary"
              isLoading={loading}
              size="lg"
              startContent={<UserPlus className="w-4 h-4" />}
              type="submit"
              variant="shadow"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-5 text-center text-sm">
            Already have an account?{" "}
            <Link
              className="text-primary font-medium inline-flex items-center gap-1"
              href="/auth/login"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
