using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.CrmService;
[Table("Lead", Schema = "CS.Mst")]
public class CrmLeadEntity : MasterBaseEntity
{
    // 🔑 Primary Key
    [Key]
    [Column("lead_unique_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string LeadUniqueId { get; set; } = Guid.NewGuid().ToString();
    // 📇 Codes
    [Column("user_lead_code")]
    [MaxLength(25)]
    [Unicode(false)]
    public string? UserLeadCode { get; set; }
    [Column("sys_lead_code")]
    [MaxLength(50)]
    [Unicode(false)]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public string? SystemLeadCode { get; set; } 
    [Column("contact_person_unique_id")]
    [MaxLength(20)]
    public string? ContactPersonUniqueId { get; set; }
    [Column("organization_unique_id")]
    [MaxLength(100)]
    public string? OrganizationUniqueId { get; set; }
    [Column("requirement_detail_json")]
    public string? RequirementDetailJson { get; set; }
    [Column("filter_detail_json")]
    public string? FilterDetailJson { get; set; }
    [Column("activity_detail_json")]
    public string? ActivityDetailJson { get; set; }
    [Column("other_detail_json")]
    public string? OtherDetailJson { get; set; }
    [Column("config_json")]
    public string? ConfigJson { get; set; }
    [Column("is_data_incomplete")]
    public bool? IsDataIncomplete { get; set; }
    [Column("last_activity_datetime")]
    public DateTime? LastActivityDateTime { get; set; }
    
}