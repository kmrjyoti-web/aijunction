using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.CrmService;
[Table("Lead", Schema = "CRM.Mst")]
public class CrmLeadEntity : MasterBaseEntity
{
    // 🔑 Primary Key
    [Key]
    [Column("lead_unique_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string LeadUniqueId { get; set; } = Guid.NewGuid().ToString();
    [Column("lead_global_id")]
    [MaxLength(50)]
    public string? LeadGlobalId { get; set; }
    [Column("lead_offline_id")]
    [MaxLength(50)]
    public string? LeadOfflineId { get; set; }
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
    [Column("contact_person_global_id")]
    [MaxLength(20)]
    public string? ContactPersonGlobalId { get; set; }
    [Column("organization_global_id")]
    [MaxLength(100)]
    public string? OrganizationGlobalId { get; set; }
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
    [Column("lead_detail_json")]
    public string? LeadDetailJson { get; set; }
    [Column("is_data_incomplete")]
    public bool? IsDataIncomplete { get; set; }
    [Column("last_activity_datetime")]
    public DateTime? LastActivityDateTime { get; set; }
    [Column("header_filter_ida")]
    [MaxLength(50)]
    public string? HeaderFilterIdA { get; set; }
    [Column("header_filter_idb")]
    [MaxLength(50)]
    public string? HeaderFilterIdB { get; set; }
    [Column("header_filter_idc")]
    [MaxLength(50)]
    public string? HeaderFilterIdC { get; set; }
    [Column("header_filter_idd")]
    [MaxLength(50)]
    public string? HeaderFilterIdD { get; set; }
    [Column("header_filter_ide")]
    [MaxLength(50)]
    public string? HeaderFilterIdE { get; set; }


    
}