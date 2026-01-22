using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.CrmService;
[Table("LeadWorkFlowDetail", Schema = "CRM.Wf")]
public class LeadWorkFlowDetailEntity : MasterBaseEntity
{
    [Key]
    [Column("workflow_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string WorkflowId { get; set; } = Guid.NewGuid().ToString();
    [Column("lead_uniq_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? LeadUniqId { get; set; }
    [Required]
    [Column("workflow_type")] // Department,Designation,Category,Groud
    [MaxLength(50)]
    public string WorkflowType { get; set; } = null!;
    [Column("workflow_child_type")] // Department,Designation,Category,Groud
    [MaxLength(50)]
    public string WorkflowChildType { get; set; } = null!;
    [Column("workflow_status")] // System_Filter,App_Filter,Web_Filter,Offline_Filter
    [MaxLength(50)]
    public string WorkflowStatus { get; set; } = null!;
    [Column("workflow_child_status")] // System_Filter,App_Filter,Web_Filter,Offline_Filter
    [MaxLength(50)]
    public string WorkflowChildStatus { get; set; } = null!;
    [Column("workflow_category")] // Filter Id Like Department_id
    [MaxLength(50)]
    public string WorkFlowCategory { get; set; } = null!;
    [Column("workflow_child_category")] // Filter Id Like Department_id
    [MaxLength(50)]
    public string WorkFlowChildCategory { get; set; } = null!;
    [Column("workflow_group")] // Filter Id Like Department_id
    [MaxLength(50)]
    public string WorkFlowGroup { get; set; } = null!;
    [Column("workflow_child_group")] // Filter Id Like Department_id
    [MaxLength(50)]
    public string WorkFlowChildGroup { get; set; } = null!;
    [Column("filter_code")] // If Anu User Defiend Code Like Department_id
    [MaxLength(50)]
    public string FilterCode { get; set; } = null!;
    
}