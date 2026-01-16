using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AvinyaCrm.SqlData.Domain.Entities.CommonService;
using Microsoft.EntityFrameworkCore;

namespace AvinyaCrm.SqlData.Domain.Entities.ContactService.Contact;

[Table("Contact", Schema = "CRM.Mst")]
[Index(nameof(UserContactCode), IsUnique = true, Name = "UX_CrmMstContact_UserContactCode")]
[Index(nameof(SystemContactCode), IsUnique = true, Name = "UX_CrmMstContact_SystemContactCode")]
[Index(nameof(PrimaryMobileNo), Name = "IX_CrmMstContact_PrimaryMobile")]
[Index(nameof(PrimaryEmail), Name = "IX_CrmMstContact_PrimaryEmail")]
public class CrmMstContactEntity : MasterBaseEntity
{
    // 🔑 Primary Key
    [Key]
    [Column("contact_unique_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ContactUniqueId { get; set; } = Guid.NewGuid().ToString();

    // 📇 Codes
    [Column("user_contact_code")]
    [MaxLength(25)]
    [Unicode(false)]
    public string? UserContactCode { get; set; }

    [Column("sys_contact_code")]
    [MaxLength(50)]
    [Unicode(false)]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public string? SystemContactCode { get; set; } 

    // 🧍 Personal Info
    [Column("salutation")]
    [MaxLength(20)]
    public string? Salutation { get; set; }

    [Column("first_name")]
    [MaxLength(100)]
    public string? FirstName { get; set; }

    [Column("middle_name")]
    [MaxLength(100)]
    public string? MiddleName { get; set; }

    [Column("last_name")]
    [MaxLength(100)]
    public string? LastName { get; set; }

    [Column("date_of_birth")]
    public DateTime? DateOfBirth { get; set; }

    [Column("anniversary_date")]
    public DateTime? AnniversaryDate { get; set; }

    // 🧑‍💼 Professional Info
    [Column("profession_id")]
    [MaxLength(36)]
    public string? ProfessionId { get; set; }
    [Column("designation_id")]
    [MaxLength(36)]
    public string? DesignationId { get; set; }
    [Column("department_id")]
    [MaxLength(36)]
    public string? DepartmentId { get; set; }
    [Column("professional_qualification_code")]
    [MaxLength(36)]
    public string? ProfessionalQualificationId { get; set; }
    [Column("qualification_id")]
    [MaxLength(36)]
    public string? QualificationId { get; set; }
    // 🧾 System Classification Codes
    [Column("system_contact_group_code")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? SystemContactGroupCode { get; set; }
    [Column("system_contact_type_code")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? SystemContactTypeCode { get; set; }
    [Column("system_contact_status_code")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? SystemContactStatusCode { get; set; }
    [Column("system_contact_source_code")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? SystemContactSourceCode { get; set; }
    [Column("system_contact_category_code")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? SystemContactCategoryCode { get; set; }
    // 🗂 User Classification FKs (Use FK navigation if possible)
    [Column("contact_group_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? ContactGroupId { get; set; }
    [Column("contact_type_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? ContactTypeId { get; set; }

    [Column("contact_status_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? ContactStatusId { get; set; }

    [Column("contact_category_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? ContactCategoryId { get; set; }

    [Column("contact_source_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? ContactSourceId { get; set; }

    // ☎ Contact Info
    [Column("primary_mobile_no")]
    [MaxLength(15)]
    [Unicode(false)]
    public string? PrimaryMobileNo { get; set; }

    [Column("primary_whatsapp_no")]
    [MaxLength(15)]
    [Unicode(false)]
    public string? PrimaryWhatsappNo { get; set; }

    [Column("primary_email")]
    [MaxLength(50)]
    public string? PrimaryEmail { get; set; }

    [Column("primary_skype")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? PrimarySkype { get; set; }

    [Column("primary_phone_no")]
    [MaxLength(15)]
    [Unicode(false)]
    public string? PrimaryPhoneNo { get; set; }

    [Column("primary_phone_ext")]
    [MaxLength(20)]
    [Unicode(false)]
    public string? PrimaryPhoneExt { get; set; }

    // 📍 Location Info
    [Column("location")]
    [MaxLength(100)]
    public string? Location { get; set; }

    [Column("postal_code")]
    [MaxLength(10)]
    [Unicode(false)]
    public string? PostalCode { get; set; }

    // ⚙️ Additional Metadata
    [Column("is_data_incomplete")]
    public bool? IsDataIncomplete { get; set; }

    [Column("last_activity_datetime")]
    public DateTime? LastActivityDateTime { get; set; }

    [Column("language_code")]
    [MaxLength(500)]
    public string? LanguageCode { get; set; }

    [Column("primary_organization_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? PrimaryOrganizationId { get; set; }

    // 🛠 Miscellaneous Fields
    [Column("other_field_a")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? OtherFieldA { get; set; }

    [Column("other_field_b")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? OtherFieldB { get; set; }

    [Column("other_field_c")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? OtherFieldC { get; set; }

    [Column("other_field_d")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? OtherFieldD { get; set; }

    [Column("other_field_e")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? OtherFieldE { get; set; }

    [Column("config_json")]
    [Unicode(false)]
    public string? ConfigJson { get; set; }
    
    [Column("profile_created_by")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? ProfileCreatedBy { get; set; }

    // 🔁 Navigation properties (add only if needed)
}