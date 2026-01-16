using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.ContactService.Contact;

[Table("Contact", Schema = "CRM.Map")]
[Index(nameof(ContactId), Name = "IX_CrmMapContact_ContactId")]
[Index(nameof(OrganizationId), Name = "IX_CrmMapContact_CompanyId")]
[Index(nameof(RowContactId), Name = "IX_CrmMapContact_RowContactId")]
public class CrmMapContactEntity : MasterBaseEntity
{
    // 🔑 Primary Key
    [Key]
    [Column("contact_mapping_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ContactMappingId { get; set; } = Guid.NewGuid().ToString();

    // 🔗 Foreign Keys
    [Column("contact_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? ContactId { get; set; }
    [Column("company_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? OrganizationId { get; set; }
    [Column("row_contact_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string? RowContactId { get; set; }
    [Column("designation_id")]
    [MaxLength(36)]
    public string? DesignationId { get; set; }
    [Column("department_id")]
    [MaxLength(36)]
    public string? DepartmentId { get; set; }
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
    [ForeignKey(nameof(ContactId))]
    public virtual CrmMstContactEntity? Contact { get; set; }

   
    
}