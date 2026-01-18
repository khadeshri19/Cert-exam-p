import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const login = async (req: Request, res: Response) => {
  const tokens = await authService.login(req.body);
  res.json(tokens);
};

export const refresh = async (req: Request, res: Response) => {
  const accessToken = await authService.refresh(req.body.token);
  res.json({ accessToken });
};

export const logout = async (req: any, res: Response) => {
  await authService.logout(req.user.id);
  res.json({ message: "Logged out" });
};

export const getUser = async (req: Request, res: Response) => {
  const user = await authService.getUser(req.params.id);
  res.json(user);
};
