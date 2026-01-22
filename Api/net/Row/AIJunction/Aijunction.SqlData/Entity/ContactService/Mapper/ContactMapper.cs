using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Aijunction.SqlData.Entity.ContactService.Contact;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.ContactService.Mapper;

[Table("Contact", Schema = "CS.Map")]
[Index(nameof(ContactGlobalId), Name = "IX_CrmMapContact_ContactGlobalId")]
[Index(nameof(OrganizationGlobalId), Name = "IX_CrmMapContact_CompanyGlobalId")]
[Index(nameof(RowContactGlobalId), Name = "IX_CrmMapContact_RowContactGlobalId")]
public class ContactMapperEntity : MasterBaseEntity
{
    // 🔑 Primary Key
    [Key]
    [Column("contact_mapping_unique_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public required string ContactMappingUniqueId { get; set; } 
    [Column("contact_mapping_global_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ContactMappingGlobalId { get; set; }
    [Column("contact_mapping_offline_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ContactMappingOfflineId { get; set; }

    // 🔗 Foreign Keys
    [Column("contact_global_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? ContactGlobalId { get; set; }
    [Column("organization_global_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? OrganizationGlobalId { get; set; }
    [Column("row_contact_global_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? RowContactGlobalId { get; set; }
    [Column("designation_global_id")]
    [MaxLength(36)]
    public string? DesignationGlobalId { get; set; }
    [Column("department_global_id")]
    [MaxLength(36)]
    public string? DepartmentGlobalId { get; set; }
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
    // 🧩 Contact Details
    [Column("contact_priority_status")]
    public int? ContactPriorityStatus { get; set; }
    [Column("last_activity_source")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? LastActivitySource { get; set; }
    [Column("last_activity_id")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? LastActivityId { get; set; }
    [Column("last_activity_date_time")]
    public DateTime? LastActivityDateTime { get; set; }
    // ✅ Verification
    [Column("verification_status")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? VerificationStatus { get; set; }
    [Column("verification_date")]
    public DateTime? VerificationDate { get; set; }
    [Column("next_verification_date")]
    public DateTime? NextVerificationDate { get; set; }
    // ⚙️ Configuration & Misc Fields
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
    [Column("other_field_f")]
    [MaxLength(100)]
    [Unicode(false)]
    public string? OtherFieldF { get; set; }
    [Column("config_json")]
    [Unicode(false)]
    public string? ConfigJson { get; set; }

    // 🔁 Navigation Properties
    [ForeignKey(nameof(ContactGlobalId))]
    public virtual MstContactEntity? Contact { get; set; }

   
    
}