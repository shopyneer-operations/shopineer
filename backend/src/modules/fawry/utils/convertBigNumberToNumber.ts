import { BigNumberInput } from "@medusajs/framework/types";

export default function convertBigNumberToNumber(input: BigNumberInput): number {
  if (typeof input === "number") {
    return input;
  }

  if (typeof input === "string") {
    return parseFloat(input);
  }

  if (typeof input === "object" && "toNumber" in input && typeof input.toNumber === "function") {
    // This handles BigNumberJS and IBigNumber types
    return input.toNumber();
  }

  // For BigNumberRawValue type
  if (typeof input === "object" && "value" in input) {
    return parseFloat(input.value as string);
  }

  throw new Error("Invalid BigNumberInput type");
}
