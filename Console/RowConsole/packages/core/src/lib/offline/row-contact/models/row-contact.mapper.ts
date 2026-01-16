import { RowContactEntity } from './row-contact.entity';
import { RowContactDto } from './row-contact.dto';
import { RowContactModel } from './row-contact.model';

export class RowContactMapper {

    static toEntity(dto: RowContactDto): RowContactEntity {
        return {
            ...dto,
            createDate: dto.createDate ? new Date(dto.createDate) : undefined,
            verificationDate: dto.verificationDate ? new Date(dto.verificationDate) : undefined,
            nextVerificationDate: dto.nextVerificationDate ? new Date(dto.nextVerificationDate) : undefined,
            lastActivityDateTime: dto.lastActivityDateTime ? new Date(dto.lastActivityDateTime) : undefined,
            syncStatus: 'SYNCED', // Default when coming from API
            lastModified: Date.now()
        };
    }

    static toDto(entity: RowContactEntity): RowContactDto {
        const { syncStatus, lastModified, ...rest } = entity;
        // Construct DTO, converting dates back to strings
        return {
            ...rest,
            createDate: entity.createDate?.toISOString(),
            verificationDate: entity.verificationDate?.toISOString(),
            nextVerificationDate: entity.nextVerificationDate?.toISOString(),
            lastActivityDateTime: entity.lastActivityDateTime?.toISOString(),
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
