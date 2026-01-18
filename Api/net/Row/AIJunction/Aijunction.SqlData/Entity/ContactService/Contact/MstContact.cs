using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Aijunction.SqlData.Entity.CommonService;
using Microsoft.EntityFrameworkCore;

namespace Aijunction.SqlData.Entity.ContactService.Contact;
[Table("Contact", Schema = "Mst")]
[Index(nameof(UserContactCode), IsUnique = true, Name = "UX_CrmMstContact_UserContactCode")]
[Index(nameof(SystemContactCode), IsUnique = true, Name = "UX_CrmMstContact_SystemContactCode")]
public class MstContactEntity : MasterBaseEntity
{
    // 🔑 Primary Key
    [Key]
    [Column("contact_unique_id")]
    [MaxLength(36)]
    [Unicode(false)]
    public string ContactUniqueId { get; set; } = Guid.NewGuid().ToString();
    // 📇 Codes
    [Column("user_contact_code")]
    [MaxLength(25)]
    [Unicode(false)]
    public string? UserContactCode { get; set; }
    [Column("sys_contact_code")]
    [MaxLength(50)]
    [Unicode(false)]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public string? SystemContactCode { get; set; } 
    // 🧍 Personal Info
    [Column("salutation")]
    [MaxLength(20)]
    public string? Salutation { get; set; }
    [Column("first_name")]
    [MaxLength(100)]
    public string? FirstName { get; set; }
    [Column("middle_name")]
    [MaxLength(100)]
    public string? MiddleName { get; set; }
    [Column("last_name")]
    [MaxLength(100)]
    public string? LastName { get; set; }
    [Column("date_of_birth")]
    public DateTime? DateOfBirth { get; set; }
    [Column("anniversary_date")]
    public DateTime? AnniversaryDate { get; set; }
    [Column("filter_detail_json")]
    public string? FilterDetailJson { get; set; }
    // ☎ Contact Info
    [Column("communication_detail_json")]
    public string? CommunicationDetailJson { get; set; }
    [Column("address_detail_json")]
    public string? AddressDetailJson { get; set; }
    // 📍 Location Info
    [Column("location")]
    [MaxLength(100)]
    public string? Location { get; set; }
    [Column("postal_code")]
    [MaxLength(10)]
    [Unicode(false)]
    public string? PostalCode { get; set; }
    // ⚙️ Additional Metadata
    [Column("is_data_incomplete")]
    public bool? IsDataIncomplete { get; set; }
    [Column("last_activity_datetime")]
    public DateTime? LastActivityDateTime { get; set; }
    [Column("language_code")]
    [MaxLength(500)]
    public string? LanguageCode { get; set; }
    // 🛠 Miscellaneous Fields
    [Column("contact_detail_json")]
    public string? ContactDetailJson { get; set; }
    [Column("other_detail_json")]
    public string? OtherDetailJson { get; set; }
    [Column("config_json")]
    public string? ConfigJson { get; set; }
}