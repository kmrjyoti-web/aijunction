using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
namespace Aijunction.SqlData.Entity.ContactService.Communication;

[Table("CommunicationBook", Schema = "CS.Mst")]
public class CommunicationBookEntity : MasterBaseEntity
{
    [Key]
    [Column("communication_unique_id")]
    [StringLength(36)]
    public required string CommunicationUniqueId { get; set; }
    [Column("communication_global_id")]
    [StringLength(50)]
    public string? CommunicationGlobalId { get; set; }
    [Column("communication_offline_id")]
    [StringLength(50)]
    public string? CommunicationOfflineId { get; set; }
    [Column("communication_type")]
    [StringLength(50)]
    public string? CommunicationType { get; set; }
    [Column("communication_detail")]
    [StringLength(100)]
    public string? CommunicationDetail { get; set; }
    [Column("communication_reference_type")]
    [StringLength(100)]
    public string? CommunicationReferenceType { get; set; }
    [Column("communication_reference_id")]
    [StringLength(100)]
    public string? CommunicationReferenceId { get; set; }
    [Column("is_call_allow")]
    public bool? IsCallAllow { get; set; } = true;
    [Column("is_message_allow")]
    public bool? IsMessageAllow { get; set; } = true;
    [Column("is_whatsapp_allow")]
    public bool? IsWhatsappAllow { get; set; } = true;
    [Column("time_slot")]
    [StringLength(50)]
    public string? TimeSlot { get; set; }
    [Column("priority_status")]
    [StringLength(25)]
    public string? PriorityStatus { get; set; }
    [Column("last_activity_datetime")]
    public DateTime? LastActivityDateTime { get; set; }
    [Column("last_activity_source")]
    [StringLength(50)]
    public string? LastActivitySource { get; set; }
    [Column("verification_status")]
    [StringLength(50)]
    public string? VerificationStatus { get; set; }
    [Column("verification_date")]
    public DateTime? VerificationDate { get; set; }
    [Column("next_verification_date")]
    public DateTime? NextVerificationDate { get; set; }
    [Column("config_json")]
    public string? ConfigJson { get; set; }
}