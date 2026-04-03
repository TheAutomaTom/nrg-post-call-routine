// Enum alternative (const object with a derived union type)

export const ResponseState = {
  Okay: "Okay",  
  Failed: "Failed",
} as const;

export type ResponseState = (typeof ResponseState)[keyof typeof ResponseState];
