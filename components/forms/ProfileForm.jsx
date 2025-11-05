"use client";
import { useForm } from "react-hook-form";
import { AppInput, AppButton } from "../ui";
import { Card } from "@heroui/react";

export const ProfileForm = ({ defaultValues, onSave }) => {
  const { register, handleSubmit } = useForm({ defaultValues });

  return (
    <Card className="p-6 space-y-4">
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <AppInput label="Name" {...register("name")} />
        <AppInput label="Email" type="email" {...register("email")} />
        <AppInput label="Bio" {...register("bio")} />
        <AppButton type="submit" color="primary">
          Save Changes
        </AppButton>
      </form>
    </Card>
  );
};
