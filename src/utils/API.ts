import axios from "axios";
import { User } from "./interfaces";

export class API {
  private static http = axios.create ({
    baseURL: process.env.API_URL
  });

  static async getUser(phone: string): Promise<User | undefined> {
    const params = {
      phone,
      token: process.env.API_WA_TOKEN
    }
    try {
     const response = await this.http
      .get<User>('/users/wa-user', { params });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
}