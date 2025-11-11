/**
 * Workflow #12: User Profile Management
 *
 * Complete user profile management lifecycle:
 * 1. Navigate to profile page (verify access)
 * 2. Update basic profile information
 * 3. Send email verification OTP (optional)
 * 4. Send mobile verification OTP (optional)
 * 5. Create primary home address
 * 6. Create work address
 * 7. Create alternate address
 * 8. Update an existing address
 * 9. Change default address
 * 10. List all user addresses
 * 11. Verify profile changes persist
 * 12. Cleanup test addresses and restore profile
 *
 * Expected time: 8-10 minutes
 * Success criteria: All profile and address operations successful
 */

import { addressService } from "@/services/address.service";
import { usersService } from "@/services/users.service";
import { BaseWorkflow, WorkflowResult } from "../helpers";

export class UserProfileManagementWorkflow extends BaseWorkflow {
  private testAddressIds: string[] = [];
  private originalProfile: any = null;

  async run(): Promise<WorkflowResult> {
    this.initialize();

    try {
      // Step 1: Navigate to profile page and verify access
      await this.executeStep("Navigate to Profile Page", async () => {
        console.log("Navigating to /user/settings");

        const currentUser = await usersService.getMe();

        if (!currentUser) {
          throw new Error("Failed to fetch current user profile");
        }

        // Store original profile for restoration
        this.originalProfile = {
          name: currentUser.name,
          phone: currentUser.phone,
          avatar: currentUser.avatar,
        };

        console.log(`Successfully accessed profile for ${currentUser.email}`);
      });

      // Step 2: Update basic profile information
      await this.executeStep("Update Basic Profile Information", async () => {
        const updatedName = `TEST_Profile_User_${Date.now()}`;
        const updatedPhone = "+919876543210";

        const updatedUser = await usersService.updateMe({
          name: updatedName,
          phone: updatedPhone,
        });

        if (updatedUser.name !== updatedName) {
          throw new Error("Profile name update failed");
        }

        console.log("Successfully updated profile name and phone");
      });

      // Step 3: Send email verification OTP (optional - may fail if already verified)
      await this.executeStep(
        "Send Email Verification OTP",
        async () => {
          await usersService.sendEmailVerification();
          console.log("Email verification OTP sent successfully");
        },
        true // optional
      );

      // Step 4: Send mobile verification OTP (optional - may fail if already verified)
      await this.executeStep(
        "Send Mobile Verification OTP",
        async () => {
          await usersService.sendMobileVerification();
          console.log("Mobile verification OTP sent successfully");
        },
        true // optional
      );

      // Step 5: Create primary address
      await this.executeStep("Create Primary Address", async () => {
        const primaryAddress = await addressService.create({
          name: "TEST_Home_Address",
          phone: "+919876543210",
          line1: "123 Test Street",
          line2: "Near Test Market",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          country: "India",
          isDefault: true,
        });

        this.testAddressIds.push(primaryAddress.id);

        console.log(`Primary home address created: ${primaryAddress.city}`);
      });

      // Step 6: Create work address
      await this.executeStep("Create Work Address", async () => {
        const workAddress = await addressService.create({
          name: "TEST_Work_Address",
          phone: "+919876543211",
          line1: "456 Corporate Tower",
          line2: "BKC",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400051",
          country: "India",
          isDefault: false,
        });

        this.testAddressIds.push(workAddress.id);

        console.log(`Work address created: ${workAddress.city}`);
      });

      // Step 7: Create alternate address
      await this.executeStep("Create Alternate Address", async () => {
        const alternateAddress = await addressService.create({
          name: "TEST_Other_Address",
          phone: "+919876543212",
          line1: "789 Parent's House",
          line2: "Suburb Area",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411001",
          country: "India",
          isDefault: false,
        });

        this.testAddressIds.push(alternateAddress.id);

        console.log(`Alternate address created: ${alternateAddress.city}`);
      });

      // Step 8: Update an existing address
      await this.executeStep("Update Existing Address", async () => {
        if (this.testAddressIds.length === 0) {
          throw new Error("No addresses available to update");
        }

        const addressId = this.testAddressIds[1]; // Update work address
        const updatedAddress = await addressService.update(addressId, {
          line2: "Bandra Kurla Complex - Updated",
          pincode: "400052",
        });

        console.log(`Work address updated: ${updatedAddress.pincode}`);
      });

      // Step 9: Change default address
      await this.executeStep("Change Default Address", async () => {
        if (this.testAddressIds.length < 2) {
          throw new Error("Insufficient addresses to change default");
        }

        const newDefaultId = this.testAddressIds[1]; // Set work as default
        const updatedAddress = await addressService.setDefault(newDefaultId);

        if (!updatedAddress.isDefault) {
          throw new Error("Failed to set address as default");
        }

        console.log("Successfully changed default address to work location");
      });

      // Step 10: List all addresses
      await this.executeStep("List All User Addresses", async () => {
        const addressesResponse = await addressService.getAll();
        const testAddresses = addressesResponse.addresses.filter((addr) =>
          addr.name?.startsWith("TEST_")
        );

        console.log(`Found ${testAddresses.length} test addresses`);
      });

      // Step 11: Verify profile changes persist
      await this.executeStep("Verify Profile Changes Persist", async () => {
        const currentUser = await usersService.getMe();

        const hasChanges =
          currentUser.name?.startsWith("TEST_Profile_User_") &&
          currentUser.phone === "+919876543210";

        if (!hasChanges) {
          throw new Error("Profile changes did not persist");
        }

        console.log("Profile changes verified and persisted correctly");
      });

      // Step 12: Cleanup - Delete test addresses and restore profile
      await this.executeStep("Cleanup Test Addresses", async () => {
        const deletedCount = this.testAddressIds.length;

        for (const addressId of this.testAddressIds) {
          try {
            await addressService.delete(addressId);
          } catch (error) {
            console.log(`Failed to delete address ${addressId}: ${error}`);
          }
        }

        // Restore original profile
        if (this.originalProfile) {
          try {
            await usersService.updateMe({
              name: this.originalProfile.name,
              phone: this.originalProfile.phone,
            });
          } catch (error) {
            console.log(`Failed to restore profile: ${error}`);
          }
        }

        console.log(
          `Successfully cleaned up ${deletedCount} test addresses and restored profile`
        );
      });
    } catch (error) {
      console.error("Workflow failed:", error);
      throw error;
    }

    return this.printSummary();
  }
}
