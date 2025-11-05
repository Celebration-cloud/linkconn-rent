"use client";
import { useForm } from "react-hook-form";
import { AppInput, AppButton } from "../ui";

export const SearchForm = ({ onSearch }) => {
  const { register, handleSubmit, reset } = useForm();

  const handleSearch = (data) => {
    onSearch(data.query);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(handleSearch)}
      className="flex gap-2 items-center"
    >
      <AppInput
        placeholder="Search news, topics..."
        {...register("query", { required: true })}
      />
      <AppButton color="primary" type="submit">
        Search
      </AppButton>
    </form>
  );
};
