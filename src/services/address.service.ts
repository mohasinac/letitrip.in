import { apiService } from "./api.service";
import { AddressBE } from "@/types/backend/address.types";
import { AddressFE, AddressFormFE } from "@/types/frontend/address.types";
import {
  toFEAddress,
  toFEAddresses,
  toBECreateAddressRequest,
} from "@/types/transforms/address.transforms";

class AddressService {
  async getAll(): Promise<AddressFE[]> {
    const response = await apiService.get<{ addresses: AddressBE[] }>(
      "/user/addresses",
    );
    return toFEAddresses(response.addresses);
  }

  async getById(id: string): Promise<AddressFE> {
    const addressBE = await apiService.get<AddressBE>(`/user/addresses/${id}`);
    return toFEAddress(addressBE);
  }

  async create(formData: AddressFormFE): Promise<AddressFE> {
    const request = toBECreateAddressRequest(formData);
    const addressBE = await apiService.post<AddressBE>(
      "/user/addresses",
      request,
    );
    return toFEAddress(addressBE);
  }

  async update(
    id: string,
    formData: Partial<AddressFormFE>,
  ): Promise<AddressFE> {
    const addressBE = await apiService.patch<AddressBE>(
      `/user/addresses/${id}`,
      formData,
    );
    return toFEAddress(addressBE);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/user/addresses/${id}`);
  }

  async setDefault(id: string): Promise<AddressFE> {
    const addressBE = await apiService.patch<AddressBE>(
      `/user/addresses/${id}`,
      {
        isDefault: true,
      },
    );
    return toFEAddress(addressBE);
  }
}

export const addressService = new AddressService();
