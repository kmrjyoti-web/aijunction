export interface RowContactEntity {
    rowContactUniqueId: string; // PK
    communicationDetail?: string;
    communicationType?: string;
    systemContactType?: string;
    systemContactCategory?: string;
    systemContactGroup?: string;
    systemContactStatus?: string;
    dndStatus?: string;
    contactPerson?: string;
    organizationName?: string;
    pinCode?: string;
    landmark?: string;
    zone?: string;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    latitude?: string;
    longitude?: string;
    createDate?: Date;
    verificationDate?: Date;
    nextVerificationDate?: Date;
    lastActivityDateTime?: Date;
    campaignCode?: string;
    licenceRegNo1?: string;
    licenceRegNo2?: string;
    licenceRegNo3?: string;
    licenceRegNo4?: string;
    licenceRegNo5?: string;
    organizationUniqueId?: string;
    contactUniqueId?: string;
    rowData?: string; // JSON string?
    noOfOrganization?: string;
    noOfContact?: number;
    verificationStatus?: string;
    mappingRowToMainContact?: string;
    mappingRowToMainOrganization?: string;
    otherFieldA?: string;
    otherFieldB?: string;
    otherFieldC?: string;
    otherFieldD?: string;
    otherFieldE?: string;
    otherFieldF?: string;
    otherFieldG?: string;
    otherFieldH?: string;
    otherFieldI?: string;
    otherFieldJ?: string;
    otherFieldK?: string;
    otherFieldL?: string;
    otherFieldM?: string;
    mobileNumber?: string;
    emailId?: string;
    productDetailA?: string;
    productDetailB?: string;
    productDetailC?: string;
    configJson?: string;

    // Offline Metadata
    syncStatus?: 'PENDING' | 'SYNCED' | 'FAILED';
    lastModified?: number; // timestamp
}
