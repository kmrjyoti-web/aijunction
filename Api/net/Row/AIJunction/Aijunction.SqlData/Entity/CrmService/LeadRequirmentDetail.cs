using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.CrmService;
[Table("LeadRequirementDetail", Schema = "CRM.Mst")]
public class LeadRequirementDetailEntity : MasterBaseEntity
{
    [Key]
    [Column("lead_requirement_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string LeadRequirementId { get; set; } = Guid.NewGuid().ToString();
    [Column("Lead_uniq_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? LeadUniqId { get; set; }
    [Required]
    [Column("requirement_type")] 
    [MaxLength(50)]
    public string RequirementType { get; set; } = null!;
    [Column("requirement_category")] 
    [MaxLength(50)]
    public string RequirementCategory { get; set; } = null!;
    [Column("requirement_group")] 
    [MaxLength(50)]
    public string RequirementGroup { get; set; } = null!;
    [Column("requirement_status")] 
    [MaxLength(50)]
    public string RequirementStatus { get; set; } = null!;
    [Column("requirement_sys_type")] 
    [MaxLength(50)]
    public string RequirementSysType { get; set; } = null!;
    [Column("product_id")] 
    [MaxLength(50)]
    public string ProductId { get; set; } = null!;
    [Column("requirement_detail")]
    [MaxLength(50)]
    public string RequirementDetail { get; set; } = null!;
    [Column("requirement_duration")] 
    [MaxLength(50)]
    public string RequirementDuration { get; set; } = null!;
    [Column("requirement_budget_min")] 
    public decimal RequirementBudgetMin { get; set; } = 0;
    [Column("requirement_budget_max")] 
    public decimal RequirementBudgetMax { get; set; } = 0;
   
    
}