using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AvinyaCrm.SqlData.Domain.Entities.CommonService;
using AvinyaCrm.SqlData.Domain.Entities.ContactService.Contact;
using AvinyaCrm.SqlData.Domain.Entities.ContactService.Organization;
using AvinyaCrm.SqlData.Domain.Entities.ContactService.RowContact;

namespace AvinyaCrm.SqlData.Domain.Entities.ContactService.Communication;

[Table("ContactBook", Schema = "CRM.Mst")]
public class CrmMstContactBookEntity : MasterBaseEntity
{
    [Key]
    [Column("communication_id")]
    [StringLength(36)]
    public string CommunicationId { get; set; } = Guid.NewGuid().ToString();

    [Column("communication_type")]
    [StringLength(50)]
    public string? CommunicationType { get; set; }

    [Column("communication_detail")]
    [StringLength(100)]
    public string? CommunicationDetail { get; set; }

    [Column("row_contact_id")]
    [StringLength(36)]
    public string? RowContactId { get; set; }

    [Column("contact_id")]
    [StringLength(36)]
    public string? ContactId { get; set; }

    [Column("organization_id")]
    [StringLength(36)]
    public string? OrganizationId { get; set; }

    [Column("is_call_allow")]
    public bool? IsCallAllow { get; set; } = true;

    [Column("is_message_allow")]
    public bool? IsMessageAllow { get; set; } = true;

    [Column("is_whatsapp_allow")]
    public bool? IsWhatsappAllow { get; set; } = true;

    [Column("time_slot")]
    [StringLength(50)]
    public string? TimeSlot { get; set; }

    [Column("contact_priority_status")]
    [StringLength(25)]
    public string? ContactPriorityStatus { get; set; }

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

    // Optional: Add navigation properties
    public CrmMstContactEntity? Contact { get; set; }
    public CrmMstOrganizationEntity? Organization { get; set; }
    public CrmMstRowContactEntity? RowContact { get; set; }
    
    
}