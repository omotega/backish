import mongoose from "mongoose";

export interface Iuser {
  _id: string;
  name: string;
  email: string;
  password: string;
  orgStatus: [
    {
      roleInOrg: "super-admin" | "admin" | "user";
      orgId: mongoose.Schema.Types.ObjectId | undefined;
    }
  ];
}

export interface IOtp {
  _id?: string;
  email: string;
  token: number;
  expired: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
