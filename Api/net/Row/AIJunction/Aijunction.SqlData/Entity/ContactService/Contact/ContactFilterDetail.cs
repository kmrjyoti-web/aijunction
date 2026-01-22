using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.ContactService.Contact;
[Table("ContactFilterDetail", Schema = "CS.Fld")]
public class ContactFilterEntity : MasterBaseEntity
{
    [Key]
    [Column("contact_filter_unique_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public required string ContactFilterUniqueId { get; set; } 
    [Column("contact_filter_global_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ContactFilterGlobalId { get; set; }
    [Column("contact_filter_offline_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ContactFilterOfflineId { get; set; }
    [Column("contact_global_id")]
    [MaxLength(50)]
    [Unicode(false)]
    public string? ContactGlobalId { get; set; }
    [Required]
    [Column("filter_type")] // Department,Designation,Category,Groud
    [MaxLength(50)]
    public string FilterType { get; set; } = null!;
    [Column("filter_status")] // System_Filter,App_Filter,Web_Filter,Offline_Filter
    [MaxLength(50)]
    public string FilterStatus { get; set; } = null!;
    [Column("filter_unique_id")] // Filter Id Like Department_id
    [MaxLength(50)]
    public string FilterUniqueId { get; set; } = null!;
    [Column("filter_code")] // If Anu User Defiend Code Like Department_id
    [MaxLength(50)]
    public string FilterCode { get; set; } = null!;
    
}