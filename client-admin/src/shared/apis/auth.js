import { axiosAuth } from "./api.js";

export const login = async (data) => {
    return await axiosAuth.post("/Log/login", data);
};
