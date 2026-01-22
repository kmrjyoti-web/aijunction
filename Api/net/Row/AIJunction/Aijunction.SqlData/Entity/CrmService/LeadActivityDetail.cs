using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.CrmService;
[Table("LeadActivityDetail", Schema = "CRM.Wf")]
public class LeadActivityDetailEntity : MasterBaseEntity
{
    [Key]
    [Column("activity_global_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ActivityGlobalId { get; set; } = Guid.NewGuid().ToString();
    [Column("lead_global_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? LeadGlobalId { get; set; }
    [Required]
    [Column("activity_type")] // Department,Designation,Category,Groud
    [MaxLength(50)]
    public string ActivityType { get; set; } = null!;
    [Column("activity_child_type")] // Department,Designation,Category,Groud
    [MaxLength(50)]
    public string ActivityChildType { get; set; } = null!;
    [Column("activity_status")] // System_Filter,App_Filter,Web_Filter,Offline_Filter
    [MaxLength(50)]
    public string ActivityStatus { get; set; } = null!;
    [Column("activity_child_status")] // System_Filter,App_Filter,Web_Filter,Offline_Filter
    [MaxLength(50)]
    public string ActivityChildStatus { get; set; } = null!;
    [Column("activity_category")] // Filter Id Like Department_id
    [MaxLength(50)]
    public string ActivityCategory { get; set; } = null!;
    [Column("activity_child_category")] // Filter Id Like Department_id
    [MaxLength(50)]
    public string ActivityChildCategory { get; set; } = null!;
    [Column("activity__group")] // Filter Id Like Department_id
    [MaxLength(50)]
    public string ActivityGroup { get; set; } = null!;
    [Column("activity_child_group")] // Filter Id Like Department_id
    [MaxLength(50)]
    public string ActivityChildGroup { get; set; } = null!;
    [Column("activity_created_date")] // If Anu User Defiend Code Like Department_id
    public DateTime ActivityCreatedDate { get; set; } 
    [Column("activity_created_by")] // Filter Id Like Department_id
    [MaxLength(50)]
    public string ActivityCreatedBy { get; set; } = null!;
    
    
}