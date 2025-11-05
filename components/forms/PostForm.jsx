"use client";
import { useForm } from "react-hook-form";
import { AppInput, AppTextarea, AppSelect, AppButton } from "../ui";
import { Card } from "@heroui/react";

export const PostForm = ({ onSubmit, categories = [] }) => {
  const { register, handleSubmit } = useForm();

  return (
    <Card className="p-6 space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AppInput
          label="Title"
          placeholder="Enter headline"
          {...register("title")}
        />
        <AppTextarea
          label="Content"
          placeholder="Write the article..."
          rows={6}
          {...register("content")}
        />
        <AppSelect
          label="Category"
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
          {...register("category")}
        />
        <AppButton type="submit" color="primary">
          Publish
        </AppButton>
      </form>
    </Card>
  );
};
