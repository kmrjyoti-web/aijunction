import { RowContactEntity } from './row-contact.entity';
import { RowContactDto } from './row-contact.dto';
import { RowContactModel } from './row-contact.model';

export class RowContactMapper {

    static toEntity(dto: RowContactDto): RowContactEntity {
        return {
            rowContactUniqueId: dto.row_contact_unique_id,
            communicationDetail: dto.communication_detail,
            communicationType: dto.communication_type,
            systemContactType: dto.system_contact_type,
            systemContactCategory: dto.system_contact_category,
            systemContactGroup: dto.system_contact_group,
            systemContactStatus: dto.system_contact_status,
            dndStatus: dto.dnd_status,
            contactPerson: dto.contact_person || '',
            organizationName: dto.organization_name || '',
            pinCode: dto.pin_code,
            landmark: dto.landmark,
            zone: dto.zone,
            country: dto.country,
            state: dto.state,
            city: dto.city,
            address: dto.address,
            latitude: dto.latitude,
            longitude: dto.longitude,
            createDate: dto.create_date ? new Date(dto.create_date) : undefined,
            verificationDate: dto.verification_date ? new Date(dto.verification_date) : undefined,
            nextVerificationDate: dto.next_verification_date ? new Date(dto.next_verification_date) : undefined,
            lastActivityDateTime: dto.last_activity_date_time ? new Date(dto.last_activity_date_time) : undefined,
            campaignCode: dto.campaign_code,
            licenceRegNo1: dto.licence_reg_no_1,
            licenceRegNo2: dto.licence_reg_no_2,
            licenceRegNo3: dto.licence_reg_no_3,
            licenceRegNo4: dto.licence_reg_no_4,
            licenceRegNo5: dto.licence_reg_no_5,
            organizationUniqueId: dto.organization_unique_id,
            contactUniqueId: dto.contact_unique_id,
            rowData: dto.row_data,
            noOfOrganization: dto.no_of_organization,
            noOfContact: dto.no_of_contact,
            verificationStatus: dto.verification_status,
            mappingRowToMainContact: dto.mapping_row_to_main_contact,
            mappingRowToMainOrganization: dto.mapping_row_to_main_organization,
            otherFieldA: dto.other_field_a,
            otherFieldB: dto.other_field_b,
            otherFieldC: dto.other_field_c,
            otherFieldD: dto.other_field_d,
            otherFieldE: dto.other_field_e,
            otherFieldF: dto.other_field_f,
            otherFieldG: dto.other_field_g,
            otherFieldH: dto.other_field_h,
            otherFieldI: dto.other_field_i,
            otherFieldJ: dto.other_field_j,
            otherFieldK: dto.other_field_k,
            otherFieldL: dto.other_field_l,
            otherFieldM: dto.other_field_m,
            mobileNumber: dto.mobile_number || '',
            emailId: dto.email_id || '',
            productDetailA: dto.product_detail_a,
            productDetailB: dto.product_detail_b,
            productDetailC: dto.product_detail_c,
            configJson: dto.config_json,

            syncStatus: 'SYNCED',
            lastModified: Date.now()
        };
    }

    static toDto(entity: RowContactEntity): RowContactDto {
        return {
            row_contact_unique_id: entity.rowContactUniqueId,
            contact_person: entity.contactPerson,
            organization_name: entity.organizationName,
            email_id: entity.emailId,
            mobile_number: entity.mobileNumber,
            communication_detail: entity.communicationDetail,
            // ... map other fields as needed, keeping it minimal for now if not strictly required
            create_date: entity.createDate?.toISOString(),
            verification_date: entity.verificationDate?.toISOString(),
        } as RowContactDto;
    }

    static toModel(entity: RowContactEntity): RowContactModel {
        return {
            id: entity.rowContactUniqueId,
            contactPerson: entity.contactPerson || '',
            organizationName: entity.organizationName || '',
            email: entity.emailId || '',
            phone: entity.mobileNumber || '',

            communicationDetail: entity.communicationDetail,
            communicationType: entity.communicationType,
            address: entity.address,
            city: entity.city,
            state: entity.state,
            country: entity.country,
            pinCode: entity.pinCode,

            status: entity.systemContactStatus,
            createdAt: entity.createDate,
            verifiedAt: entity.verificationDate,

            originalData: entity
        };
    }
}
