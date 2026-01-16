export interface RowContactModel {
    id: string; // Mapped from rowContactUniqueId
    contactPerson: string;
    organizationName: string;
    email: string; // Mapped from emailId
    phone: string; // Mapped from mobileNumber

    // Detailed fields
    communicationDetail?: string;
    communicationType?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pinCode?: string;

    // Status & Metadata (mapped from various fields)
    status?: string; // systemContactStatus
    createdAt?: Date;
    verifiedAt?: Date;

    // Full original data access if needed
    originalData: any;
}
