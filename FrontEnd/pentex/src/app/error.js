"use client";
export default function Error(error) {
  console.log(error);
  throw new error();
}
