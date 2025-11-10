import { apiService } from "./api.service";
import { Address } from "@/types";

class AddressService {
  async getAll(): Promise<{ addresses: Address[] }> {
    return apiService.get<{ addresses: Address[] }>("/user/addresses");
  }

  async getById(id: string): Promise<Address> {
    return apiService.get<Address>(`/user/addresses/${id}`);
  }

  async create(
    data: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">,
  ): Promise<Address> {
    return apiService.post<Address>("/user/addresses", data);
  }

  async update(
    id: string,
    data: Partial<Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">>,
  ): Promise<Address> {
    return apiService.patch<Address>(`/user/addresses/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/user/addresses/${id}`);
  }

  async setDefault(id: string): Promise<Address> {
    return apiService.patch<Address>(`/user/addresses/${id}`, {
      isDefault: true,
    });
  }
}

export const addressService = new AddressService();
