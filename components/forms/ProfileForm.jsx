"use client";
import { useForm } from "react-hook-form";
import { Card } from "@heroui/react";

import { AppInput, AppButton } from "../ui";

export const ProfileForm = ({ defaultValues, onSave }) => {
  const { register, handleSubmit } = useForm({ defaultValues });

  return (
    <Card className="p-6 space-y-4">
      <form className="space-y-4" onSubmit={handleSubmit(onSave)}>
        <AppInput label="Name" {...register("name")} />
        <AppInput label="Email" type="email" {...register("email")} />
        <AppInput label="Bio" {...register("bio")} />
        <AppButton color="primary" type="submit">
          Save Changes
        </AppButton>
      </form>
    </Card>
  );
};
