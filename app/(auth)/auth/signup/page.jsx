"use client";

import { useEffect, useState } from "react";
import { runWorker, uploadFile } from "@/lib/puterClient";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/zodSchemas";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "@/lib/redux/slices/userSlice";
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
        router.push(
          data.onboarded
            ? `/dashboard/${data.role}`
            : `/onboarding/${data.role}`
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
        <h1 className="text-2xl font-bold mt-3">Create Your Account</h1>
      </div>

      <Card className="bg-card border border-default-200/50 shadow-xl">
        <CardBody>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              {...register("fullName")}
              label="Full Name"
              placeholder="Enter your full name"
              variant="bordered"
              isInvalid={!!formState.errors.fullName}
              errorMessage={formState.errors.fullName?.message}
            />

            <Input
              {...register("email")}
              label="Email"
              placeholder="Enter your email"
              type="email"
              variant="bordered"
              isInvalid={!!formState.errors.email}
              errorMessage={formState.errors.email?.message}
            />

            <Input
              {...register("password")}
              label="Password"
              placeholder="••••••••"
              type="password"
              variant="bordered"
              isInvalid={!!formState.errors.password}
              errorMessage={formState.errors.password?.message}
            />

            <Controller
              name="role"
              control={control}
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
                  <SelectItem key="agent">Agent</SelectItem>
                  <SelectItem key="tenant">Tenant</SelectItem>
                </Select>
              )}
            />

            {role === "landlord" && (
              <Input
                {...register("companyName")}
                label="Company Name"
                placeholder="Enter your company name"
                variant="bordered"
                isInvalid={!!formState.errors.companyName}
                errorMessage={formState.errors.companyName?.message}
              />
            )}

            {role === "agent" && (
              <Input
                {...register("agencyName")}
                label="Agency Name"
                placeholder="Enter your agency name"
                variant="bordered"
                isInvalid={!!formState.errors.agencyName}
                errorMessage={formState.errors.agencyName?.message}
              />
            )}

            <Input
              {...register("address")}
              label="Address"
              placeholder="Enter your address"
              variant="bordered"
              isInvalid={!!formState.errors.address}
              errorMessage={formState.errors.address?.message}
            />

            <Controller
              name="profilePic"
              control={control}
              render={({ field }) => (
                <Input
                  type="file"
                  variant="flat"
                  startContent={<FileImage className="w-4 h-4" />}
                  label="Profile Picture"
                  onChange={(e) => field.onChange(e.target.files)}
                />
              )}
            />

            <Button
              type="submit"
              color="primary"
              variant="shadow"
              size="lg"
              isLoading={loading}
              startContent={<UserPlus className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-5 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary font-medium inline-flex items-center gap-1"
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
